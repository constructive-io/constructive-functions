-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/expires_at/column


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP COLUMN expires_at RESTRICT;


