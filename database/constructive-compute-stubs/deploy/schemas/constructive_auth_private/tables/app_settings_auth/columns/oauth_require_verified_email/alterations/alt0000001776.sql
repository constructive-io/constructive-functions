-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/alterations/alt0000001776
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN oauth_require_verified_email SET NOT NULL;

