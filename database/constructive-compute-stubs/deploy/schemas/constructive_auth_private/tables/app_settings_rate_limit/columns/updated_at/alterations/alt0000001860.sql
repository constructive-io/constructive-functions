-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/updated_at/alterations/alt0000001860
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/updated_at/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN updated_at SET DEFAULT now();

