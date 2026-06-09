-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/id/alterations/alt0000001827
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/id/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN id SET NOT NULL;

