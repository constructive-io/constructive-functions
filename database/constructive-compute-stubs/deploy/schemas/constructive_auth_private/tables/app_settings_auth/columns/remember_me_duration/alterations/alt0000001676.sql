-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/remember_me_duration/alterations/alt0000001676
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/remember_me_duration/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN remember_me_duration SET NOT NULL;

