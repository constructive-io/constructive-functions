-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_rate_limit_window/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ADD COLUMN ip_rate_limit_window interval;

