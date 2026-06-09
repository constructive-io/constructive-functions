-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/mfa_level/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN mfa_level RESTRICT;


