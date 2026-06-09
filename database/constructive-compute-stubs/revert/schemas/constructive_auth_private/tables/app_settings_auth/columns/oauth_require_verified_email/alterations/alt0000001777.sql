-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/alterations/alt0000001777


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN oauth_require_verified_email DROP DEFAULT;


