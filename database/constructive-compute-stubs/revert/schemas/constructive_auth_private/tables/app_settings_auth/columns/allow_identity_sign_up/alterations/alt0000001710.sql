-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_identity_sign_up/alterations/alt0000001710


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_identity_sign_up DROP DEFAULT;


