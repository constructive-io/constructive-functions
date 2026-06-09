-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/updated_at/alterations/alt0000001810
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/updated_at/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN updated_at SET DEFAULT now();

