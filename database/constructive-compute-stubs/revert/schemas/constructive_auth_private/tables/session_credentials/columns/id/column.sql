-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN id RESTRICT;


