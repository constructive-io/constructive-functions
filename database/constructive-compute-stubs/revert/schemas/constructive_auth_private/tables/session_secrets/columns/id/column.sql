-- Revert: schemas/constructive_auth_private/tables/session_secrets/columns/id/column


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP COLUMN id RESTRICT;


