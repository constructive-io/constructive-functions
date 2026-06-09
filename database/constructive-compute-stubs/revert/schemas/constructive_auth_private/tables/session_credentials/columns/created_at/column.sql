-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/created_at/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN created_at RESTRICT;


