-- Revert: schemas/constructive_auth_private/tables/sessions/columns/created_at/alterations/alt0000001638


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN created_at DROP DEFAULT;


