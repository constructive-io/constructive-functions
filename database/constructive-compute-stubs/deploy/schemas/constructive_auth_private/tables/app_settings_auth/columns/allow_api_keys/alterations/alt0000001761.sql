-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_api_keys/alterations/alt0000001761
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_api_keys/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_api_keys SET DEFAULT true;

