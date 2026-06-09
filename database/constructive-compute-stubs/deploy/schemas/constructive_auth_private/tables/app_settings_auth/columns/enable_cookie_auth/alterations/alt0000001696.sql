-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/alterations/alt0000001696
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.enable_cookie_auth IS E'Whether to enable HTTP cookie-based authentication (requires CSRF protection)';

