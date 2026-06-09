-- Revert: schemas/constructive_auth_private/tables/sessions/columns/auth_method/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN auth_method RESTRICT;


