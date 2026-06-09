-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/alterations/alt0000001690
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_multiple_sessions IS 'Whether users can have multiple active sessions simultaneously';

