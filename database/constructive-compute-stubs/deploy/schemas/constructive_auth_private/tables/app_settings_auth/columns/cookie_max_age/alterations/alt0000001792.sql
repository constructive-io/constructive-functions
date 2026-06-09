-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_max_age/alterations/alt0000001792
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_max_age/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN cookie_max_age SET NOT NULL;

