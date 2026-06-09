-- Revert: schemas/constructive_auth_private/tables/sessions/columns/origin/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN origin RESTRICT;


