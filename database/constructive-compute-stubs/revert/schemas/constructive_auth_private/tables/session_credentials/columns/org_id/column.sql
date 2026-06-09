-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/org_id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN org_id RESTRICT;


