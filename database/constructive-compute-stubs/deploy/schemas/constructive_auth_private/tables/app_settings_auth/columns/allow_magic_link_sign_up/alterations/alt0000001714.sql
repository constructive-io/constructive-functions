-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_up/alterations/alt0000001714
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_up/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_magic_link_sign_up IS 'Whether magic link account creation is allowed';

