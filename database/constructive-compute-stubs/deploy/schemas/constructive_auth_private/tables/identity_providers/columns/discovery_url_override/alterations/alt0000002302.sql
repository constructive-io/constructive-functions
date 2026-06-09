-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/discovery_url_override/alterations/alt0000002302
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/discovery_url_override/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.discovery_url_override IS E'Optional non-standard discovery document URL. When NULL, discovery uses {issuer_url}/.well-known/openid-configuration. Used for IdPs that publish discovery at a non-spec path.';

