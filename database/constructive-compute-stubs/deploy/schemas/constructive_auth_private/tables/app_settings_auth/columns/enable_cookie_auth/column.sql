-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ADD COLUMN enable_cookie_auth boolean;

