-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/created_at/alterations/alt0000001809
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/created_at/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN created_at SET DEFAULT now();

