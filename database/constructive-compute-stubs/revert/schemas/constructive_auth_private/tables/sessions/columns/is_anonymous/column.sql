-- Revert: schemas/constructive_auth_private/tables/sessions/columns/is_anonymous/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN is_anonymous RESTRICT;


