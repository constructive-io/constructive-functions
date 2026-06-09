-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_secure/alterations/alt0000001782


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_secure DROP NOT NULL;


