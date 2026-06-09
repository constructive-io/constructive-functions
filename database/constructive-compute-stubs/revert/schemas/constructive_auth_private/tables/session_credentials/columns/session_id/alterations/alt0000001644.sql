-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/session_id/alterations/alt0000001644


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN session_id DROP NOT NULL;


