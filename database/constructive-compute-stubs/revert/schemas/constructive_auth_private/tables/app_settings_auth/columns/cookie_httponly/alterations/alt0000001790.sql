-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_httponly/alterations/alt0000001790


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_httponly DROP DEFAULT;


