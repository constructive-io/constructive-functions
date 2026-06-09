-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/alterations/alt0000001695
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN enable_cookie_auth SET DEFAULT false;

