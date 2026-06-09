-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ADD COLUMN user_max_attempts int;

