-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/name/column


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP COLUMN name RESTRICT;


