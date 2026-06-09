-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/created_at/alterations/alt0000001859
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/created_at/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN created_at SET DEFAULT now();

