-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/updated_at/column


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP COLUMN updated_at RESTRICT;


