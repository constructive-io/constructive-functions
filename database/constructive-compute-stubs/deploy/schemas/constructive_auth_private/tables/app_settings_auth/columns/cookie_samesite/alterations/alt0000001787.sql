-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_samesite/alterations/alt0000001787
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/cookie_samesite/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.cookie_samesite IS E'SameSite attribute for the auth cookie: strict, lax, or none';

