terraform {
  required_providers {
    aws = {
      version = ">=5.32.0"
      source  = "hashicorp/aws"
    }
  }
}
provider "aws" {
  region = "ca-central-1"
}
