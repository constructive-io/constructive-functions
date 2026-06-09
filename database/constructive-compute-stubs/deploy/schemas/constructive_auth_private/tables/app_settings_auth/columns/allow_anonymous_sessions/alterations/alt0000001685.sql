-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/alterations/alt0000001685
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_anonymous_sessions SET NOT NULL;

