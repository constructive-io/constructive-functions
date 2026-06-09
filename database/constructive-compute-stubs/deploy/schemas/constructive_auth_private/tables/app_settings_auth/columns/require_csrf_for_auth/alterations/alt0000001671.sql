-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/alterations/alt0000001671
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN require_csrf_for_auth SET DEFAULT true;

