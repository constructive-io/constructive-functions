-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/updated_at/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN updated_at RESTRICT;


