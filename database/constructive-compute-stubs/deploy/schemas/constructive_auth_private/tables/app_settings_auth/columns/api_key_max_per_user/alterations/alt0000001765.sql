-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/alterations/alt0000001765
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.api_key_max_per_user IS 'Maximum number of active API keys a single user may hold';

