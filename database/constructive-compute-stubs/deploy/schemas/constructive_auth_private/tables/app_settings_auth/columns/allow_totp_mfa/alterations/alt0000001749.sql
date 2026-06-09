-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/alterations/alt0000001749
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_totp_mfa SET DEFAULT true;

