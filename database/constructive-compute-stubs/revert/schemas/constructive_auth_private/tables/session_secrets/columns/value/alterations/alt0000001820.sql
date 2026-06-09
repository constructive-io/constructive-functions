-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/value/alterations/alt0000001820


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN value DROP NOT NULL;


