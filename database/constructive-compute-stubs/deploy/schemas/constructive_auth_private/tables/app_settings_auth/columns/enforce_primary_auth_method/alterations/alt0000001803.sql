-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/alterations/alt0000001803
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.enforce_primary_auth_method IS E'When true, users can only sign in with their primary auth method (set on first sign-up). When false, any linked method can create sessions.';

