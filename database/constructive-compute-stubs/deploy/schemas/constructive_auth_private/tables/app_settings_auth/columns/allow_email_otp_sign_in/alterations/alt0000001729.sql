-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_email_otp_sign_in/alterations/alt0000001729
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_email_otp_sign_in/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_email_otp_sign_in IS E'Whether passwordless email OTP sign-in is allowed';

