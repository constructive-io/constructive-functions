-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_mfa/alterations/alt0000001747
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_mfa/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.require_mfa IS 'Whether all users are required to set up MFA';

