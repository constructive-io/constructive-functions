-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/client_id/alterations/alt0000002306
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/client_id/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.client_id IS E'OAuth2 / OIDC client_id registered with the IdP. NULL for built-in rows until an admin sets it. Providers with NULL client_id or NULL client_secret_id are treated as not-configured by the sign-in path regardless of the enabled flag.';

