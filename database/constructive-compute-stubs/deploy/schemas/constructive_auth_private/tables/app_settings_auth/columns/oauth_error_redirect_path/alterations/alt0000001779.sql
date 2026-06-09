-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001779
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN oauth_error_redirect_path SET NOT NULL;

