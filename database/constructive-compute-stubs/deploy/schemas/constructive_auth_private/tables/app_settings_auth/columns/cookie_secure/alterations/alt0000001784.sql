-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_secure/alterations/alt0000001784
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_secure/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.cookie_secure IS E'Whether the auth cookie should be sent only over HTTPS (Secure flag)';

