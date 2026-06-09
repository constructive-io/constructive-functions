-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/updated_at/alterations/alt0000001665


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN updated_at DROP DEFAULT;


