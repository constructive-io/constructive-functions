-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN mfa_challenge_expiry RESTRICT;


