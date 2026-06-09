-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_auth_methods/alterations/alt0000001804
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allowed_auth_methods/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allowed_auth_methods IS E'Array of allowed auth methods (e.g. password, identity, magic_link, sms, email_otp). NULL means all methods are allowed.';

