-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_path/alterations/alt0000001797
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_path/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.cookie_path IS 'Path scope for the auth cookie';

