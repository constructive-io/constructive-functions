-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/alterations/alt0000001764
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN api_key_max_per_user SET DEFAULT 10;

