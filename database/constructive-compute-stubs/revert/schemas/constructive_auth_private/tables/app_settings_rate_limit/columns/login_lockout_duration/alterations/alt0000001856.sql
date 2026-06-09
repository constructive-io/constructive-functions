-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_lockout_duration/alterations/alt0000001856


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN login_lockout_duration DROP NOT NULL;


