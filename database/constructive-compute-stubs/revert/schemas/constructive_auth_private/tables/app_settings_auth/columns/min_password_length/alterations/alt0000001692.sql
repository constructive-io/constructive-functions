-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/alterations/alt0000001692


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN min_password_length DROP DEFAULT;


