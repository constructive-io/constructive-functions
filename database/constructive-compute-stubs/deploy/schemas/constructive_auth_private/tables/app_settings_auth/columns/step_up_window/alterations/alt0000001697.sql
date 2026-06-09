-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/step_up_window/alterations/alt0000001697
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/step_up_window/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN step_up_window SET NOT NULL;

