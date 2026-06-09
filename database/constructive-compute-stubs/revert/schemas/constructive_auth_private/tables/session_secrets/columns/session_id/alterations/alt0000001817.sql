-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/alterations/alt0000001817


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN session_id DROP DEFAULT;


