-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP COLUMN user_rate_limit_window RESTRICT;


