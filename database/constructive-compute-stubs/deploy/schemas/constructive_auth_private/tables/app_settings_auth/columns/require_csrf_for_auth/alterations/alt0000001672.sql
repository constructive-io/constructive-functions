-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/alterations/alt0000001672
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.require_csrf_for_auth IS E'Whether to enforce CSRF token validation on sign_in and sign_up endpoints';

