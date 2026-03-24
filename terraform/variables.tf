variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "3rd-project-frontend"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for frontend assets (must be globally unique)"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "gateway_origin_domain_name" {
  description = "Public gateway ALB domain used as the CloudFront API/BFF origin"
  type        = string
  default     = "k8s-donmoadevgateway-3983261778-1519590243.ap-northeast-2.elb.amazonaws.com"
}

variable "keycloak_origin_domain_name" {
  description = "Public Keycloak ALB domain used as the CloudFront OAuth origin"
  type        = string
  default     = "k8s-donmoadevpublic-0339585d5d-2072655666.ap-northeast-2.elb.amazonaws.com"
}
