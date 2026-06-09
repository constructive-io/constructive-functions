-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/discovery_doc/alterations/alt0000002303
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/discovery_doc/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.discovery_doc IS E'Cached OIDC discovery document (authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri, issuer, etc.). Refreshed by a background job; auth-server reads endpoints from here at request time when kind = ''oidc''.';

