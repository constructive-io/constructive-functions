-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/slug/alterations/alt0000002287
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/slug/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.slug IS E'Stable identifier (e.g. ''google'', ''github'', ''custom:acme-okta''). Used as connected_accounts.service value. Custom providers must use the custom:<slug> namespace; format ^[a-z0-9][a-z0-9_-]{0,30}[a-z0-9]$ enforced by admin procedure.';

