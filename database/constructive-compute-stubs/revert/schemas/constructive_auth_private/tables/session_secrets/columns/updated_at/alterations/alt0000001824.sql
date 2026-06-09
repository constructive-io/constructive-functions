-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/updated_at/alterations/alt0000001824


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


