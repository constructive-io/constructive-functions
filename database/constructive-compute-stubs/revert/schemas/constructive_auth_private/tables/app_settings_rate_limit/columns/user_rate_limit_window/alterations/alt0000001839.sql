-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/alterations/alt0000001839


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN user_rate_limit_window DROP DEFAULT;


