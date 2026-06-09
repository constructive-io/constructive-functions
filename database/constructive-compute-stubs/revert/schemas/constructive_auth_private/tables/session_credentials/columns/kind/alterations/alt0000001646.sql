-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/kind/alterations/alt0000001646


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN kind DROP NOT NULL;


