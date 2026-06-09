-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_mfa/alterations/alt0000001745
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_mfa/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN require_mfa SET NOT NULL;

