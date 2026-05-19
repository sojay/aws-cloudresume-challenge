import hashlib
import json
import os
import time
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("VISITOR_TABLE_NAME", "cloudresume-test")
EVENT_TTL_DAYS = int(os.environ.get("VISITOR_EVENT_TTL_DAYS", "90"))
VISITOR_ID_MAX_LENGTH = 128

table = boto3.resource("dynamodb").Table(TABLE_NAME)


def lambda_handler(event, context):
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    now_epoch = int(now.timestamp())
    expires_at = now_epoch + EVENT_TTL_DAYS * 24 * 60 * 60

    headers = normalize_headers(event.get("headers") or {})
    query = event.get("queryStringParameters") or {}
    request_context = event.get("requestContext") or {}
    http_context = request_context.get("http") or {}

    source_ip = first_header_value(headers, "x-forwarded-for") or http_context.get("sourceIp") or "unknown"
    source_ip = source_ip.split(",")[0].strip() or "unknown"
    user_agent = headers.get("user-agent", "unknown")
    referer = headers.get("referer") or headers.get("referrer")
    path = query.get("path") or http_context.get("path") or "/"
    visitor_id = normalize_visitor_id(query.get("visitorId"))

    visitor_key = stable_hash(visitor_id or f"{source_ip}|{user_agent}")
    visitor_item_id = f"visitor#{visitor_key}"
    stats_item_id = "site#stats"
    legacy_stats_item_id = "1"
    daily_visitor_item_id = f"daily-visitor#{now.date().isoformat()}#{visitor_key}"
    event_item_id = f"event#{now_iso}#{getattr(context, 'aws_request_id', visitor_key)}"

    location = extract_location(headers)
    ip_hash = stable_hash(source_ip)
    user_agent_hash = stable_hash(user_agent)

    new_visitor = try_create_visitor(
        visitor_item_id=visitor_item_id,
        visitor_key=visitor_key,
        now_iso=now_iso,
        source_ip=source_ip,
        ip_hash=ip_hash,
        user_agent=user_agent,
        user_agent_hash=user_agent_hash,
        location=location,
    )

    update_visitor(visitor_item_id, now_iso, source_ip, ip_hash, user_agent, user_agent_hash, location)
    ensure_stats_item(stats_item_id, legacy_stats_item_id, now_iso)
    stats = update_stats(stats_item_id, legacy_stats_item_id, now_iso, new_visitor)
    create_daily_visitor(daily_visitor_item_id, visitor_key, now_iso, expires_at, location)
    log_event(
        event_item_id=event_item_id,
        visitor_key=visitor_key,
        now_iso=now_iso,
        expires_at=expires_at,
        source_ip=source_ip,
        ip_hash=ip_hash,
        user_agent=user_agent,
        user_agent_hash=user_agent_hash,
        referer=referer,
        path=path,
        new_visitor=new_visitor,
        location=location,
    )

    body = {
        "total_pageviews": int(stats.get("total_pageviews", 0)),
        "unique_visitors": int(stats.get("unique_visitors", 0)),
        "new_visitor": new_visitor,
    }

    # Backward-compatible alias for older frontend code and Cloud Resume Challenge checks.
    body["views"] = body["total_pageviews"]

    return {
        "statusCode": 200,
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-store",
        },
        "body": json.dumps(body),
    }


def normalize_headers(headers):
    return {str(key).lower(): str(value) for key, value in headers.items() if value is not None}


def first_header_value(headers, name):
    value = headers.get(name)
    if not value:
        return None
    return value.split(",")[0].strip()


def normalize_visitor_id(visitor_id):
    if not visitor_id:
        return None
    visitor_id = str(visitor_id).strip()
    if not visitor_id or len(visitor_id) > VISITOR_ID_MAX_LENGTH:
        return None
    return visitor_id


def stable_hash(value):
    return hashlib.sha256(str(value).encode("utf-8")).hexdigest()


def extract_location(headers):
    # These headers are available when the Lambda is reached through CloudFront
    # with viewer location headers enabled. Direct Lambda Function URLs do not
    # include city/region/country, so those fields remain unknown until a CDN or
    # GeoIP enrichment layer is added.
    return {
        "country": headers.get("cloudfront-viewer-country", "unknown"),
        "region": headers.get("cloudfront-viewer-country-region", "unknown"),
        "city": headers.get("cloudfront-viewer-city", "unknown"),
        "timezone": headers.get("cloudfront-viewer-time-zone", "unknown"),
    }


def try_create_visitor(visitor_item_id, visitor_key, now_iso, source_ip, ip_hash, user_agent, user_agent_hash, location):
    try:
        table.put_item(
            Item={
                "id": visitor_item_id,
                "entity_type": "visitor",
                "visitor_key": visitor_key,
                "first_seen_at": now_iso,
                "last_seen_at": now_iso,
                "pageviews": Decimal(0),
                "ip_address": source_ip,
                "ip_hash": ip_hash,
                "user_agent": user_agent,
                "user_agent_hash": user_agent_hash,
                **location,
            },
            ConditionExpression="attribute_not_exists(id)",
        )
        return True
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return False
        raise


def update_visitor(visitor_item_id, now_iso, source_ip, ip_hash, user_agent, user_agent_hash, location):
    table.update_item(
        Key={"id": visitor_item_id},
        UpdateExpression=(
            "SET last_seen_at = :now, ip_address = :ip, ip_hash = :ip_hash, "
            "user_agent = :ua, user_agent_hash = :ua_hash, country = :country, "
            "#region = :region, city = :city, #timezone = :timezone "
            "ADD pageviews :one"
        ),
        ExpressionAttributeNames={
            "#region": "region",
            "#timezone": "timezone",
        },
        ExpressionAttributeValues={
            ":now": now_iso,
            ":ip": source_ip,
            ":ip_hash": ip_hash,
            ":ua": user_agent,
            ":ua_hash": user_agent_hash,
            ":country": location["country"],
            ":region": location["region"],
            ":city": location["city"],
            ":timezone": location["timezone"],
            ":one": Decimal(1),
        },
    )


def ensure_stats_item(stats_item_id, legacy_stats_item_id, now_iso):
    legacy_views = Decimal(0)
    legacy_response = table.get_item(Key={"id": legacy_stats_item_id})
    legacy_item = legacy_response.get("Item") or {}
    if "views" in legacy_item:
        legacy_views = legacy_item["views"]

    try:
        table.put_item(
            Item={
                "id": stats_item_id,
                "entity_type": "site_stats",
                "total_pageviews": legacy_views,
                "unique_visitors": Decimal(0),
                "created_at": now_iso,
                "updated_at": now_iso,
            },
            ConditionExpression="attribute_not_exists(id)",
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") != "ConditionalCheckFailedException":
            raise


def update_stats(stats_item_id, legacy_stats_item_id, now_iso, new_visitor):
    response = table.update_item(
        Key={"id": stats_item_id},
        UpdateExpression=(
            "SET entity_type = if_not_exists(entity_type, :entity_type), updated_at = :now "
            "ADD total_pageviews :one, unique_visitors :new_unique"
        ),
        ExpressionAttributeValues={
            ":entity_type": "site_stats",
            ":now": now_iso,
            ":one": Decimal(1),
            ":new_unique": Decimal(1 if new_visitor else 0),
        },
        ReturnValues="ALL_NEW",
    )

    stats = response.get("Attributes", {})

    # Keep the legacy Cloud Resume Challenge counter item in sync for older checks.
    table.update_item(
        Key={"id": legacy_stats_item_id},
        UpdateExpression="SET #views = :views",
        ExpressionAttributeNames={"#views": "views"},
        ExpressionAttributeValues={":views": stats.get("total_pageviews", Decimal(0))},
    )

    return stats


def create_daily_visitor(daily_visitor_item_id, visitor_key, now_iso, expires_at, location):
    try:
        table.put_item(
            Item={
                "id": daily_visitor_item_id,
                "entity_type": "daily_visitor",
                "visitor_key": visitor_key,
                "seen_at": now_iso,
                "expires_at": Decimal(expires_at),
                **location,
            },
            ConditionExpression="attribute_not_exists(id)",
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") != "ConditionalCheckFailedException":
            raise


def log_event(
    event_item_id,
    visitor_key,
    now_iso,
    expires_at,
    source_ip,
    ip_hash,
    user_agent,
    user_agent_hash,
    referer,
    path,
    new_visitor,
    location,
):
    table.put_item(
        Item={
            "id": event_item_id,
            "entity_type": "pageview_event",
            "visitor_key": visitor_key,
            "seen_at": now_iso,
            "expires_at": Decimal(expires_at),
            "path": path,
            "referer": referer or "direct",
            "new_visitor": new_visitor,
            "ip_address": source_ip,
            "ip_hash": ip_hash,
            "user_agent": user_agent,
            "user_agent_hash": user_agent_hash,
            **location,
        }
    )
