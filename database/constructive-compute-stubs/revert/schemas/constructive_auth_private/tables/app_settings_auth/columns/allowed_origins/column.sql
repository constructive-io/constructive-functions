-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_origins/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN allowed_origins RESTRICT;


