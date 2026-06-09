-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_default_duration/alterations/alt0000001768
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_default_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.api_key_default_duration IS E'Default lifetime for an API key when the caller does not supply expires_in';

