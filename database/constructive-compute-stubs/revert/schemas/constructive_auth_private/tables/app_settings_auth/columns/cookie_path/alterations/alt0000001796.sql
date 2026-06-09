-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_path/alterations/alt0000001796


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_path DROP DEFAULT;


