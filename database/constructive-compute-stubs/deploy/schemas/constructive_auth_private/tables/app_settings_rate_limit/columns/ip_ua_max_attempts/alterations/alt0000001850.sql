-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_ua_max_attempts/alterations/alt0000001850
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_ua_max_attempts/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN ip_ua_max_attempts SET NOT NULL;

