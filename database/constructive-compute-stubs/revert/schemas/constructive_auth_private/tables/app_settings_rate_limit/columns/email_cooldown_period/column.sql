-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP COLUMN email_cooldown_period RESTRICT;


