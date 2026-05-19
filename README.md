# AWS Cloud Resume Challenge

My implementation of the [Cloud Resume Challenge](https://cloudresumechallenge.dev) by Forrest Brazeal. A full-stack cloud project that combines a SvelteKit resume site with a serverless visitor counter, deployed on AWS and managed with Terraform.

![Architecture diagram](https://github.com/user-attachments/assets/a6caef06-4fbd-40cd-ad8f-6de0e29bdac8)

## Architecture

```
Browser → CloudFront → S3 (static site)
                ↓
         Lambda Function URL → DynamoDB (visitor counter)
```

- **Frontend**: SvelteKit (adapter-static) built and synced to S3
- **CDN**: CloudFront distribution in front of S3, custom domain via Route 53
- **Visitor counter**: Python Lambda with a direct Function URL (no API Gateway)
- **Database**: DynamoDB table tracking unique visitors and pageview events
- **IaC**: Terraform manages Lambda, DynamoDB, IAM, and CloudWatch
- **CI/CD**: GitHub Actions builds the frontend and syncs to S3 on push to `main`

## Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 5, Tailwind-free custom CSS |
| Hosting | S3 + CloudFront |
| DNS | Route 53 |
| Backend | Python 3.x Lambda (Function URL) |
| Database | DynamoDB |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Region | ca-central-1 |

## Project Structure

```
aws-cloudresume-challenge/
├── resume-site/                  SvelteKit frontend
│   ├── src/
│   │   ├── routes/+page.svelte   Homepage
│   │   ├── routes/+layout.svelte Root layout
│   │   └── app.css               Design system tokens + styles
│   ├── static/assets/            Images and PDFs
│   └── build/                    Compiled output (not committed)
├── infra/
│   ├── main.tf                   Terraform: Lambda, DynamoDB, IAM
│   └── lambda/
│       └── lambda_function.py    Visitor counter Lambda
└── .github/workflows/
    └── front-end-cicd.yml        Build and deploy pipeline
```

## Local Development

```bash
cd resume-site
npm install
npm run dev
```

## Deploy

The CI/CD pipeline handles deploys on push to `main`. To deploy manually:

```bash
cd resume-site
npm run build
aws s3 sync build/ s3://<your-bucket>/ --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

> Build must run before every deploy. `git push` alone does not update the live site.

## Infrastructure

```bash
cd infra
terraform init
eval "$(aws configure export-credentials --format env)"
terraform plan
terraform apply
```

Required environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`

## GitHub Actions Secrets

| Secret | Value |
|---|---|
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |
