-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_origins/alterations/alt0000001800
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_origins/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allowed_origins IS E'Array of allowed CORS origins for API requests; NULL means allow all (replaces api_modules JSON approach)';

