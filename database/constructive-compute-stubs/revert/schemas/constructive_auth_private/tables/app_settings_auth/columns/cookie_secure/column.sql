-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_secure/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN cookie_secure RESTRICT;


