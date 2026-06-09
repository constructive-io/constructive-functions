-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_default_duration/alterations/alt0000001767
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_default_duration/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN api_key_default_duration SET DEFAULT '90 days'::interval;

