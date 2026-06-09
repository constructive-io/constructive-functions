-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/alterations/alt0000001701
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN mfa_challenge_expiry SET DEFAULT '5 minutes'::interval;

