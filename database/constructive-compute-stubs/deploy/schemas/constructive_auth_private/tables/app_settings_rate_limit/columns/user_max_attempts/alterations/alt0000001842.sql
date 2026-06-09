-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/alterations/alt0000001842
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN user_max_attempts SET DEFAULT 10;

