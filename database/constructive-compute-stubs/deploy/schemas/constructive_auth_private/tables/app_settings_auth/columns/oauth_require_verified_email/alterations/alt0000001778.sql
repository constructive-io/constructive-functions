-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/alterations/alt0000001778
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.oauth_require_verified_email IS E'Whether to reject OAuth sign-up when the identity provider reports the email as unverified; defends against shadow account attacks';

