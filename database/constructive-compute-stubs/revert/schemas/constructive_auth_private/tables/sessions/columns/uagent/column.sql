-- Revert: schemas/constructive_auth_private/tables/sessions/columns/uagent/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN uagent RESTRICT;


