-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_samesite/alterations/alt0000001785
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_samesite/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_samesite SET NOT NULL;

