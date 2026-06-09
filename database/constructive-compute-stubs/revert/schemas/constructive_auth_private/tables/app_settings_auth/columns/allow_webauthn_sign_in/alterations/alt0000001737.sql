-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_in/alterations/alt0000001737


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_webauthn_sign_in DROP DEFAULT;


