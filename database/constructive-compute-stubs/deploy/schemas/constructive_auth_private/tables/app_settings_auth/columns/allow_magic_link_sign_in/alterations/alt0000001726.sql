-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_in/alterations/alt0000001726
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_in/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_magic_link_sign_in IS E'Whether passwordless magic link sign-in is allowed';

