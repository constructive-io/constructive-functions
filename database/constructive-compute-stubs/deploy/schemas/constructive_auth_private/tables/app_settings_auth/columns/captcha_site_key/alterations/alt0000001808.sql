-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/captcha_site_key/alterations/alt0000001808
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/captcha_site_key/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.captcha_site_key IS E'Public reCAPTCHA site key; the secret key should be stored as a simple_secret';

