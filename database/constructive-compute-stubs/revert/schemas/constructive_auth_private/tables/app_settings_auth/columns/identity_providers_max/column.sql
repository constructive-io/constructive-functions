-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN identity_providers_max RESTRICT;


