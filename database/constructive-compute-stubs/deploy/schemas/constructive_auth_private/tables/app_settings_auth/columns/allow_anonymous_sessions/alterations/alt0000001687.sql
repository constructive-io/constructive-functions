-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/alterations/alt0000001687
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_anonymous_sessions IS E'Whether to allow anonymous sessions (useful for CSRF protection and shopping carts)';

