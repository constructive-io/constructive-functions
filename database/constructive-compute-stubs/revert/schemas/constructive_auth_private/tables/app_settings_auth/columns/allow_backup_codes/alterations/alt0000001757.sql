-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_backup_codes/alterations/alt0000001757


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_backup_codes DROP NOT NULL;


