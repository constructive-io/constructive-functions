-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/session_id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN session_id RESTRICT;


