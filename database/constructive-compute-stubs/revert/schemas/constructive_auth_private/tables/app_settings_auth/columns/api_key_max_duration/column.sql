-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_duration/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN api_key_max_duration RESTRICT;


