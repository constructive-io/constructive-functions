-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sms_mfa/alterations/alt0000001756
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sms_mfa/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_sms_mfa IS 'Whether SMS code MFA is allowed';

