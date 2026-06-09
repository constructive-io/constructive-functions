-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/alterations/alt0000001750
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_totp_mfa IS 'Whether TOTP authenticator app MFA is allowed';

