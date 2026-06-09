-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/alterations/alt0000001802


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN enforce_primary_auth_method DROP DEFAULT;


