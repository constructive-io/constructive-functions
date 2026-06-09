-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_auth_methods/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ADD COLUMN allowed_auth_methods text[];

