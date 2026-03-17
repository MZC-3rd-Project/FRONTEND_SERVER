terraform {
  backend "s3" {
    bucket  = "donmoa-terraform-state"   # Terraform state 전용 버킷 (수동으로 미리 생성)
    key     = "frontend/dev/terraform.tfstate"
    region  = "ap-northeast-2"
    encrypt = true
  }
}
