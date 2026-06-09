-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_samesite/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN cookie_samesite RESTRICT;


