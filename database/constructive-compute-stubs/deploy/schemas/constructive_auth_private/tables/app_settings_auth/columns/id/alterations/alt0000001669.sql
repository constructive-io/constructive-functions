-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/id/alterations/alt0000001669
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/id/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN id SET DEFAULT uuidv7();

