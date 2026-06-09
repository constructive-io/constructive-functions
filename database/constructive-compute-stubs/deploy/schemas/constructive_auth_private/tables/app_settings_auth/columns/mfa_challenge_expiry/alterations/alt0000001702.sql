-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/alterations/alt0000001702
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.mfa_challenge_expiry IS 'How long an MFA challenge token remains valid after password verification';

