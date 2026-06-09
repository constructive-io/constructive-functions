-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_lockout_duration/alterations/alt0000001836
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_lockout_duration/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN ip_lockout_duration SET DEFAULT '30 minutes'::interval;

