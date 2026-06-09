-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_default_duration/alterations/alt0000001766


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN api_key_default_duration DROP NOT NULL;


