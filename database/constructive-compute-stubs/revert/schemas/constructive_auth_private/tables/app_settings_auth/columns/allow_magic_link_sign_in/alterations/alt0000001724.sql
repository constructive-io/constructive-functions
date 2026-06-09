-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_in/alterations/alt0000001724


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_magic_link_sign_in DROP NOT NULL;


