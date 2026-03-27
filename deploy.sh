#!/bin/bash
set -e

# -----------------------------------------------
# Frontend 빌드 → S3 업로드 → CloudFront 캐시 무효화
# 사전 조건: aws CLI, terraform, node/npm 설치 필요
# -----------------------------------------------

TERRAFORM_DIR="$(dirname "$0")/terraform"

echo "=== 1. 프론트엔드 빌드 ==="
if [ -z "${VITE_TOSS_CLIENT_KEY:-}" ]; then
  echo "[WARN] VITE_TOSS_CLIENT_KEY is not set. Falling back to the frontend default Toss client key."
fi
npm run build

echo "=== 2. Terraform으로 인프라 프로비저닝 ==="
cd "$TERRAFORM_DIR"
terraform init
terraform apply -auto-approve

# Terraform output에서 값 추출
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CF_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
CF_URL=$(terraform output -raw cloudfront_domain_name)

cd ..

echo "=== 3. S3에 파일 업로드 ==="
# index.html: 캐시 금지
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# 나머지 파일 동기화 (assets/는 해시 포함이므로 장기 캐싱)
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "=== 4. CloudFront 캐시 무효화 ==="
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*"

echo ""
echo "✅ 배포 완료!"
echo "   URL: $CF_URL"
