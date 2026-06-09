-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/alterations/alt0000001844


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN user_lockout_duration DROP NOT NULL;


