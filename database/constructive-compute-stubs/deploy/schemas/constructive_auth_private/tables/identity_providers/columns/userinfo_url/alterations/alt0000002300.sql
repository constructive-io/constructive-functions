-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/userinfo_url/alterations/alt0000002300
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/userinfo_url/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.userinfo_url IS E'OAuth2 userinfo endpoint (returns the user profile given an access token). Required when kind = ''oauth2''; for kind = ''oidc'' resolved from cached discovery_doc or used as a fallback when the id_token does not contain the desired claims.';

