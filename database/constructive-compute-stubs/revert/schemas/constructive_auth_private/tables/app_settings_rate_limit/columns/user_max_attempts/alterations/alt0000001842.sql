-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/alterations/alt0000001842


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN user_max_attempts DROP DEFAULT;


