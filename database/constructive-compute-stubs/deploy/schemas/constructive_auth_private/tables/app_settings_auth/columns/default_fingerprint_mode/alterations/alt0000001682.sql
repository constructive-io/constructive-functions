-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/alterations/alt0000001682
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN default_fingerprint_mode SET NOT NULL;

