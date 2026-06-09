-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_max_age/alterations/alt0000001793


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_max_age DROP DEFAULT;


