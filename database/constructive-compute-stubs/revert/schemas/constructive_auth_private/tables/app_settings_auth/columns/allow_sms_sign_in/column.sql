-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sms_sign_in/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN allow_sms_sign_in RESTRICT;


