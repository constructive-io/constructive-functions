-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_auth_methods/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN allowed_auth_methods RESTRICT;


