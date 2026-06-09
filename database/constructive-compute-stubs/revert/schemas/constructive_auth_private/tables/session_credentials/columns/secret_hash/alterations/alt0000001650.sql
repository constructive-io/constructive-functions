-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/alterations/alt0000001650


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN secret_hash DROP NOT NULL;


