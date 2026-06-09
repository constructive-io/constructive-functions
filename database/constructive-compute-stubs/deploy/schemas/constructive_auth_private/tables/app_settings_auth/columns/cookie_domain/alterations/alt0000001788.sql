-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_domain/alterations/alt0000001788
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_domain/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.cookie_domain IS E'Domain scope for the auth cookie (e.g. .example.com); NULL uses the request origin';

