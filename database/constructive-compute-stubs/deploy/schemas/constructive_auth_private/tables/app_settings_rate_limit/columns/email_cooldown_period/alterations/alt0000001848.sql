-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/alterations/alt0000001848
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN email_cooldown_period SET DEFAULT '1 minute'::interval;

