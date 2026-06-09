-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/id/alterations/alt0000001642


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN id DROP NOT NULL;


