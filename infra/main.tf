locals {
  aws_region = "ca-central-1"
  account_id = "783038225397"
}

resource "aws_dynamodb_table" "cloudresume_test" {
  name           = "cloudresume-test"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 5
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    project = "Cloud Resume Challenge"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }
}

resource "aws_iam_role" "cloud_resume_api_role" {
  name = "cloud-resume-test-api-role-h8eue2z6"
  path = "/service-role/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_basic_execution" {
  name = "AWSLambdaBasicExecutionRole-5b17fb43-2d84-41a3-a227-e4b2cbfe47eb"
  path = "/service-role/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "logs:CreateLogGroup"
        Resource = "arn:aws:logs:${local.aws_region}:${local.account_id}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = [
          "arn:aws:logs:${local.aws_region}:${local.account_id}:log-group:/aws/lambda/cloud-resume-test-api:*",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.cloud_resume_api_role.name
  policy_arn = aws_iam_policy.lambda_basic_execution.arn
}

resource "aws_iam_policy" "visitor_table_access" {
  name = "cloud-resume-test-api-visitor-table-access"
  path = "/service-role/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ]
        Resource = aws_dynamodb_table.cloudresume_test.arn
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "visitor_table_access" {
  role       = aws_iam_role.cloud_resume_api_role.name
  policy_arn = aws_iam_policy.visitor_table_access.arn
}


resource "aws_cloudwatch_log_group" "cloud_resume_api" {
  name              = "/aws/lambda/cloud-resume-test-api"
  retention_in_days = 30
}

data "archive_file" "cloud_resume_api_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/lambda_function.py"
  output_path = "${path.module}/lambda/lambda_function.zip"
}

resource "aws_lambda_function" "cloud_resume_api" {
  filename         = data.archive_file.cloud_resume_api_zip.output_path
  source_code_hash = data.archive_file.cloud_resume_api_zip.output_base64sha256
  function_name    = "cloud-resume-test-api"
  role             = aws_iam_role.cloud_resume_api_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"

  architectures = ["x86_64"]
  memory_size   = 128
  timeout       = 3

  environment {
    variables = {
      VISITOR_EVENT_TTL_DAYS = "90"
      VISITOR_TABLE_NAME     = aws_dynamodb_table.cloudresume_test.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.visitor_table_access,
    aws_cloudwatch_log_group.cloud_resume_api,
  ]
}

resource "aws_lambda_function_url" "cloud_resume_api" {
  function_name      = aws_lambda_function.cloud_resume_api.function_name
  authorization_type = "NONE"
  invoke_mode        = "BUFFERED"

  cors {
    allow_origins = ["*"]
  }
}
