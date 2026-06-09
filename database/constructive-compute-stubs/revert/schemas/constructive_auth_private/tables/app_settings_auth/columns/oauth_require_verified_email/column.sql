-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN oauth_require_verified_email RESTRICT;


