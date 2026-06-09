-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/alterations/alt0000001691
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN min_password_length SET NOT NULL;

