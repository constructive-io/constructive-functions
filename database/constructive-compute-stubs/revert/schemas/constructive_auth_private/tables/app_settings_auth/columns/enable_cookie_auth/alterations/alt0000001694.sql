-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/alterations/alt0000001694


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN enable_cookie_auth DROP NOT NULL;


