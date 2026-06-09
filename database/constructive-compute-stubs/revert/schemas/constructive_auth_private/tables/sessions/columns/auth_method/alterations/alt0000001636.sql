-- Revert: schemas/constructive_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001636


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN auth_method DROP DEFAULT;


