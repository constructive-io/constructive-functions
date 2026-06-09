-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/alterations/alt0000002310
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.scopes IS E'OAuth2 scopes requested in the authorization URL. For kind = ''oidc'' the admin procedure ensures ''openid'' is always present (silently prepended if missing).';

