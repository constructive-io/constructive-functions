-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sms_sign_in/alterations/alt0000001730


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_sms_sign_in DROP NOT NULL;


