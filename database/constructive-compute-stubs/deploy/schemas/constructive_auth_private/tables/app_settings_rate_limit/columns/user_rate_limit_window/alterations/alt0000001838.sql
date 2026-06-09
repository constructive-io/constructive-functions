-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/alterations/alt0000001838
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN user_rate_limit_window SET NOT NULL;

