-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/alterations/alt0000001770
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN identity_providers_max SET NOT NULL;

