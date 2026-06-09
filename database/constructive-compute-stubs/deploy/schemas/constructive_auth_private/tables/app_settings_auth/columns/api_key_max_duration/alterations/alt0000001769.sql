-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_duration/alterations/alt0000001769
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/api_key_max_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.api_key_max_duration IS E'Upper bound on API key lifetime; caller-supplied expires_in is clamped to this. NULL disables the cap (useful for development)';

