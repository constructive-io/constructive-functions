-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/alterations/alt0000001739


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_webauthn_usernameless DROP NOT NULL;


