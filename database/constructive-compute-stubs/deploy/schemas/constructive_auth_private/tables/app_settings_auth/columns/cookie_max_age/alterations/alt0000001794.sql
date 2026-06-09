-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_max_age/alterations/alt0000001794
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_max_age/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.cookie_max_age IS E'Max-Age for the auth cookie; defaults to match default_session_duration';

