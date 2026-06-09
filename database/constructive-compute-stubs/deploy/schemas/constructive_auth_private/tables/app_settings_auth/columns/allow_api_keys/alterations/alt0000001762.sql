-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_api_keys/alterations/alt0000001762
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_api_keys/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_api_keys IS 'Whether API key creation is allowed';

