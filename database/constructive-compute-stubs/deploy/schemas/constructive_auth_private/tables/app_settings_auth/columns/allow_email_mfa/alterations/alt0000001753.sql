-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_email_mfa/alterations/alt0000001753
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_email_mfa/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_email_mfa IS 'Whether email code MFA is allowed';

