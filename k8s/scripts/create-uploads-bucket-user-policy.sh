#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./create-uploads-bucket-user-policy.sh <bucket-name> <iam-user-name> [aws-region] [aws-profile]
#
# Example:
#   ./create-uploads-bucket-user-policy.sh constructive-media constructive-media-user us-east-1 default
#
# Requirements:
#   - AWS CLI v2 installed and configured (account with permissions to create buckets & IAM users)
#   - The profile/credentials you use to run this script should have:
#       s3:CreateBucket, s3:PutBucketPolicy, s3:PutBucketCors (optional)
#       iam:CreateUser, iam:PutUserPolicy, iam:CreateAccessKey

BUCKET_NAME="${1:-}"
IAM_USER_NAME="${2:-}"
AWS_REGION="${3:-us-east-1}"
AWS_PROFILE="${4:-default}"

if [[ -z "$BUCKET_NAME" || -z "$IAM_USER_NAME" ]]; then
  echo "Usage: $0 <bucket-name> <iam-user-name> [aws-region] [aws-profile]" >&2
  exit 1
fi

echo "Using profile:  ${AWS_PROFILE}"
echo "AWS region:     ${AWS_REGION}"
echo "Bucket name:    ${BUCKET_NAME}"
echo "IAM user name:  ${IAM_USER_NAME}"
echo

# 1) Create bucket if needed
echo "==> Creating bucket (if not exists)..."

CREATE_ARGS=(--profile "$AWS_PROFILE" --region "$AWS_REGION" s3api create-bucket --bucket "$BUCKET_NAME")

# us-east-1 cannot use LocationConstraint
if [[ "$AWS_REGION" != "us-east-1" ]]; then
  CREATE_ARGS+=(--create-bucket-configuration "LocationConstraint=$AWS_REGION")
fi

if ! aws "${CREATE_ARGS[@]}" 2>create-bucket.err; then
  if grep -q 'BucketAlreadyOwnedByYou' create-bucket.err; then
    echo "Bucket '${BUCKET_NAME}' already exists and is owned by you. Continuing."
  else
    echo "Error creating bucket (see create-bucket.err):" >&2
    cat create-bucket.err >&2 || true
    rm -f create-bucket.err
    exit 1
  fi
fi
rm -f create-bucket.err

echo "Bucket ready: ${BUCKET_NAME}"
echo

# 1b) Set bucket policy for public read (idempotent)
echo "==> Applying public-read bucket policy..."

TMP_BUCKET_POLICY_FILE="$(mktemp)"

cat > "$TMP_BUCKET_POLICY_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws --profile "$AWS_PROFILE" s3api put-bucket-policy \
  --bucket "$BUCKET_NAME" \
  --policy "file://${TMP_BUCKET_POLICY_FILE}"

rm -f "$TMP_BUCKET_POLICY_FILE"
echo "Bucket policy set to allow public read of objects."
echo

# 2) Create IAM user (if not exists)
echo "==> Creating IAM user (if not exists)..."

if aws --profile "$AWS_PROFILE" iam get-user --user-name "$IAM_USER_NAME" >/dev/null 2>&1; then
  echo "IAM user '${IAM_USER_NAME}' already exists. Continuing."
else
  aws --profile "$AWS_PROFILE" iam create-user --user-name "$IAM_USER_NAME" >/dev/null
  echo "Created IAM user: ${IAM_USER_NAME}"
fi
echo

# 3) Attach least-privilege S3 policy for this bucket
echo "==> Attaching S3 policy to IAM user..."

POLICY_NAME="${IAM_USER_NAME}-s3-${BUCKET_NAME}"
TMP_POLICY_FILE="$(mktemp)"

cat > "$TMP_POLICY_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketLevel",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}"
    },
    {
      "Sid": "ObjectLevel",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:HeadObject",
        "s3:AbortMultipartUpload",
        "s3:CreateMultipartUpload",
        "s3:UploadPart",
        "s3:CompleteMultipartUpload",
        "s3:ListMultipartUploadParts",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws --profile "$AWS_PROFILE" iam put-user-policy \
  --user-name "$IAM_USER_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://${TMP_POLICY_FILE}"

rm -f "$TMP_POLICY_FILE"
echo "Attached inline policy '${POLICY_NAME}' to user '${IAM_USER_NAME}'."
echo

# 4) Create or reuse access key pair (idempotent-ish)
echo "==> Ensuring IAM user has an access key..."

EXISTING_KEYS=$(aws --profile "$AWS_PROFILE" iam list-access-keys \
  --user-name "$IAM_USER_NAME" \
  --query 'AccessKeyMetadata[].AccessKeyId' \
  --output text || true)

if [[ -n "$EXISTING_KEYS" ]]; then
  echo "User already has access key(s):"
  echo "$EXISTING_KEYS"
  echo
  echo "No new access key created. If you need a fresh key/secret, delete old keys"
  echo "with 'aws iam delete-access-key' and re-run this script."
  echo
else
  echo "Creating new access key for IAM user..."
  read -r ACCESS_KEY_ID SECRET_ACCESS_KEY < <(
    aws --profile "$AWS_PROFILE" iam create-access-key \
      --user-name "$IAM_USER_NAME" \
      --query 'AccessKey.[AccessKeyId,SecretAccessKey]' \
      --output text
  )

  echo
  echo "==> GraphQL server env values (add to your deployment):"
  cat <<EOF

BUCKET_NAME=${BUCKET_NAME}
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}

# For Constructive config this becomes:
# cdn.bucketName      = BUCKET_NAME
# cdn.awsRegion       = AWS_REGION
# cdn.awsAccessKey    = AWS_ACCESS_KEY_ID
# cdn.awsSecretKey    = AWS_SECRET_ACCESS_KEY
# cdn.minioEndpoint   = (unset for real AWS S3)
EOF
fi

echo
echo "Done."
