-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_password_sign_up/alterations/alt0000001707


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_password_sign_up DROP DEFAULT;


