-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/created_at/alterations/alt0000001664


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN created_at DROP DEFAULT;


