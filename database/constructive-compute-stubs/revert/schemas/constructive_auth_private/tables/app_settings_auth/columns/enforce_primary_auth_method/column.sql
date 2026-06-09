-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN enforce_primary_auth_method RESTRICT;


