-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/alterations/alt0000001771


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN identity_providers_max DROP DEFAULT;


