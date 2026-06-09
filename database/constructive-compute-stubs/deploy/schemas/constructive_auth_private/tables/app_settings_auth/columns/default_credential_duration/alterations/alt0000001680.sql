-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_credential_duration/alterations/alt0000001680
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_credential_duration/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN default_credential_duration SET DEFAULT '1 hour'::interval;

