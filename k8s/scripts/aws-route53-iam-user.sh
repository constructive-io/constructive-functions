ZONE_ID=REPLACE_WITH_ROUTE53_ZONE_ID
ISSUER_NAMESPACE=interweb
ISSUER_NAME=launchql-issuer
IAM_USER=certmgr-route53
AWS_PROFILE=default

# Create the IAM user
aws iam create-user --user-name "$IAM_USER" --profile ${AWS_PROFILE}

# Create a zone-scoped policy (inline JSON)
cat > /tmp/route53-dns01-$ZONE_ID.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowRecordChangesInSpecificZone",
      "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets"],
      "Resource": "arn:aws:route53:::hostedzone/$ZONE_ID"
    },
    {
      "Sid": "AllowChangeStatusChecks",
      "Effect": "Allow",
      "Action": ["route53:GetChange"],
      "Resource": "arn:aws:route53:::change/*"
    }
  ]
}
EOF

# Create a managed policy from that JSON
POLICY_ARN=$(aws iam create-policy \
  --policy-name route53-dns01-$ZONE_ID \
  --profile ${AWS_PROFILE} \
  --policy-document file:///tmp/route53-dns01-$ZONE_ID.json \
  --query 'Policy.Arn' --output text)

# Attach the policy to the user
aws iam attach-user-policy --user-name "$IAM_USER" --policy-arn "$POLICY_ARN"

# Create access keys (save output; you’ll need the secret once)
CREDS_JSON=$(aws iam create-access-key --user-name "$IAM_USER")
export AWS_ACCESS_KEY_ID=$(echo "$CREDS_JSON" | jq -r .AccessKey.AccessKeyId)
export AWS_SECRET_ACCESS_KEY=$(echo "$CREDS_JSON" | jq -r .AccessKey.SecretAccessKey)

echo "AccessKeyId: $AWS_ACCESS_KEY_ID"
echo "SecretAccessKey: $AWS_SECRET_ACCESS_KEY"   # store securely!
#!/usr/bin/env bash
set -euo pipefail

# Config (override via env vars when calling the script)
: "${ZONE_ID:?Set ZONE_ID to your Route53 hosted zone ID, e.g. Z0000000000000000000}"
: "${IAM_USER:=certmgr-route53}"
: "${AWS_PROFILE:=default}"
: "${AWS_REGION:=us-east-1}"
POLICY_NAME="route53-dns01-${ZONE_ID}"

# Tools + AWS CLI behavior
command -v aws >/dev/null 2>&1 || { echo "awscli not found"; exit 1; }
command -v jq  >/dev/null 2>&1 || { echo "jq not found"; exit 1; }
export AWS_PAGER=""
AWS=(aws --profile "${AWS_PROFILE}" --region "${AWS_REGION}" --no-cli-pager)

echo "Using profile='${AWS_PROFILE}', region='${AWS_REGION}'"

# Quick credential check (helps catch expired SSO or wrong env cred overrides)
if ! "${AWS[@]}" sts get-caller-identity >/dev/null 2>&1; then
  echo "ERROR: Invalid/expired credentials for profile '${AWS_PROFILE}'." >&2
  echo "- If using SSO: run 'aws sso login --profile ${AWS_PROFILE}' and retry." >&2
  echo "- If env vars are set (AWS_ACCESS_KEY_ID/SECRET/SESSION_TOKEN), unset them or ensure they are valid." >&2
  exit 1
fi

# Ensure IAM user exists (idempotent)
if ! "${AWS[@]}" iam get-user --user-name "${IAM_USER}" >/dev/null 2>&1; then
  echo "Creating IAM user: ${IAM_USER}"
  "${AWS[@]}" iam create-user --user-name "${IAM_USER}" >/dev/null
else
  echo "IAM user exists: ${IAM_USER}"
fi

# Ensure the zone-scoped policy exists (idempotent)
POLICY_ARN=$("${AWS[@]}" iam list-policies --scope Local \
  --query "Policies[?PolicyName=='${POLICY_NAME}'].Arn" --output text || true)

if [[ -z "${POLICY_ARN}" || "${POLICY_ARN}" == "None" ]]; then
  echo "Creating policy ${POLICY_NAME} for hosted zone ${ZONE_ID}"
  TMP_JSON=$(mktemp)
  cat >"${TMP_JSON}" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowRecordChangesInSpecificZone",
      "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets"],
      "Resource": "arn:aws:route53:::hostedzone/${ZONE_ID}"
    },
    {
      "Sid": "AllowChangeStatusChecks",
      "Effect": "Allow",
      "Action": ["route53:GetChange"],
      "Resource": "arn:aws:route53:::change/*"
    }
  ]
}
EOF
  POLICY_ARN=$("${AWS[@]}" iam create-policy \
    --policy-name "${POLICY_NAME}" \
    --policy-document file://"${TMP_JSON}" \
    --query 'Policy.Arn' --output text)
  echo "Created policy: ${POLICY_ARN}"
else
  echo "Policy exists: ${POLICY_ARN}"
fi

# Attach the policy to the user (idempotent)
ATTACHED=$("${AWS[@]}" iam list-attached-user-policies --user-name "${IAM_USER}" \
  --query "AttachedPolicies[?PolicyName=='${POLICY_NAME}'].PolicyArn" --output text || true)
if [[ -z "${ATTACHED}" || "${ATTACHED}" == "None" ]]; then
  echo "Attaching policy to user"
  "${AWS[@]}" iam attach-user-policy --user-name "${IAM_USER}" --policy-arn "${POLICY_ARN}"
else
  echo "Policy already attached to user"
fi

# Create access key and print it
echo "Creating a new access key for ${IAM_USER}"
CREDS_JSON=$("${AWS[@]}" iam create-access-key --user-name "${IAM_USER}")
AWS_ACCESS_KEY_ID=$(echo "${CREDS_JSON}" | jq -r .AccessKey.AccessKeyId)
AWS_SECRET_ACCESS_KEY=$(echo "${CREDS_JSON}" | jq -r .AccessKey.SecretAccessKey)

echo "AccessKeyId: ${AWS_ACCESS_KEY_ID}"
echo "SecretAccessKey: ${AWS_SECRET_ACCESS_KEY}  (store securely!)"
