-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_captcha/alterations/alt0000001807
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_captcha/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.enable_captcha IS E'Whether CAPTCHA verification is required on sign-up and password-reset endpoints';

