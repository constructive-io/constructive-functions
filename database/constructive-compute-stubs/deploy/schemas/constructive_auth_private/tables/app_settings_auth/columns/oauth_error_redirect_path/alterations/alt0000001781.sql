-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001781
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.oauth_error_redirect_path IS 'URL path the server redirects the browser to when an OAuth flow fails';

