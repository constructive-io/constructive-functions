-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/alterations/alt0000001772
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/identity_providers_max/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.identity_providers_max IS E'Maximum number of custom (non-built-in) identity providers that can be configured per database. Built-in providers (google, github, apple, facebook, microsoft) are exempt from this quota. Enforced by create_identity_provider at write time.';

