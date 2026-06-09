-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/alterations/alt0000001848


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN email_cooldown_period DROP DEFAULT;


