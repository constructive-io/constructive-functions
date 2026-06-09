-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/name/alterations/alt0000001818


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN name DROP NOT NULL;


