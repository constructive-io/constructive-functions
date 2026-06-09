-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/name/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN name RESTRICT;


