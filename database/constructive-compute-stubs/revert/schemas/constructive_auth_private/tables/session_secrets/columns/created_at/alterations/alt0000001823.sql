-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/alterations/alt0000001823


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


