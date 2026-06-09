-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/expires_at/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN expires_at RESTRICT;


