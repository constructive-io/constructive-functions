-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_password_sign_in/alterations/alt0000001718


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_password_sign_in DROP NOT NULL;


