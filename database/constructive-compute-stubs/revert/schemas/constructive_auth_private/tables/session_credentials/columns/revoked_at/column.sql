-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/revoked_at/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN revoked_at RESTRICT;


