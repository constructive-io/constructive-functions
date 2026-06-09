-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/alterations/alt0000001741
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_webauthn_usernameless IS E'Whether usernameless / conditional-UI passkey sign-in is allowed (discoverable credentials)';

