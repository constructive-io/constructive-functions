-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/kind/alterations/alt0000002292
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/kind/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.kind IS E'Protocol family: ''oauth2'' (manual endpoint configuration) or ''oidc'' (discovery + JWKS-verified id_token). Future kinds (''saml'') will use a different field set.';

