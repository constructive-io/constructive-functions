-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/alterations/alt0000001748


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_totp_mfa DROP NOT NULL;


