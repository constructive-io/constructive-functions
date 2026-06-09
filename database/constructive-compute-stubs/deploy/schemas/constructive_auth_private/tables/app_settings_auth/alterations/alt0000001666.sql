-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/alterations/alt0000001666
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DISABLE ROW LEVEL SECURITY;

