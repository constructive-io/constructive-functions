-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP COLUMN user_lockout_duration RESTRICT;


