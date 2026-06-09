-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/created_at/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN created_at RESTRICT;


