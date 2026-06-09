-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN default_fingerprint_mode RESTRICT;


