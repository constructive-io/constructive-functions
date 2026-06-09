-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/id/alterations/alt0000001815


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN id DROP DEFAULT;


