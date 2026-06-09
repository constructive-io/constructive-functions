-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_api_keys/alterations/alt0000001760


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_api_keys DROP NOT NULL;


