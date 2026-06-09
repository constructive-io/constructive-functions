-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP COLUMN login_max_attempts RESTRICT;


