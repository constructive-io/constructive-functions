-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN secret_hash RESTRICT;


