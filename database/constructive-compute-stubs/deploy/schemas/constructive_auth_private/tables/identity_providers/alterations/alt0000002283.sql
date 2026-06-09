-- Deploy: schemas/constructive_auth_private/tables/identity_providers/alterations/alt0000002283
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table


COMMENT ON TABLE "constructive_auth_private".identity_providers IS E'OAuth2 / OIDC (and future SAML) identity provider definitions per database. Built-in providers (google, github, apple, ...) are seeded as is_built_in=true rows; custom providers use slugs of the form custom:<slug>. Holds endpoint URLs, encrypted client secret reference, scopes, audience validation list, PKCE setting, and email-handling flags. Cached OIDC discovery_doc + JWKS are refreshed by background jobs. All writes go through SECURITY DEFINER admin procedures.';

