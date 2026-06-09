-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_in/alterations/alt0000001736


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_webauthn_sign_in DROP NOT NULL;


