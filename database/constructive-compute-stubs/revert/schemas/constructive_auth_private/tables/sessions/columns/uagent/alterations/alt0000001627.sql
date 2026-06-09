-- Revert: schemas/constructive_auth_private/tables/sessions/columns/uagent/alterations/alt0000001627


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN uagent DROP DEFAULT;


