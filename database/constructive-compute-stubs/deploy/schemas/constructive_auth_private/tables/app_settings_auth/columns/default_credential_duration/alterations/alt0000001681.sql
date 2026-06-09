-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_credential_duration/alterations/alt0000001681
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_credential_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.default_credential_duration IS 'Default expiration for bearer token credentials';

