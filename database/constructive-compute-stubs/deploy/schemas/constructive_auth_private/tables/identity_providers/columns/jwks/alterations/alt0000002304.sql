-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/jwks/alterations/alt0000002304
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/jwks/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.jwks IS E'Cached JWKS document used to verify id_token signatures. Refreshed by a background job. NULL until first successful discovery + JWKS fetch.';

