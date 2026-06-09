-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001779


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN oauth_error_redirect_path DROP NOT NULL;


