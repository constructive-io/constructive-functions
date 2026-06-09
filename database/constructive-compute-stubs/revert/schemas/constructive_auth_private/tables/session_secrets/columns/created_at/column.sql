-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/column


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP COLUMN created_at RESTRICT;


