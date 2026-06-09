-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sign_up/alterations/alt0000001704


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_sign_up DROP DEFAULT;


