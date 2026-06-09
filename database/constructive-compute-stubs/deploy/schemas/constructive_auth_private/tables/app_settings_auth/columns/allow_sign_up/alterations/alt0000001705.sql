-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sign_up/alterations/alt0000001705
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_sign_up/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_sign_up IS E'Master switch: whether new user registration is allowed';

