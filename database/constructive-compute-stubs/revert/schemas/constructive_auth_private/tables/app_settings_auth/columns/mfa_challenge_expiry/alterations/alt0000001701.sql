-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/alterations/alt0000001701


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN mfa_challenge_expiry DROP DEFAULT;


