-- Revert: schemas/constructive_auth_private/tables/sessions/columns/id/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN id RESTRICT;


