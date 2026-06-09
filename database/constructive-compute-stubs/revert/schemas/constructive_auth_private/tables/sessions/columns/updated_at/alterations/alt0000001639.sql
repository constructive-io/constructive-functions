-- Revert: schemas/constructive_auth_private/tables/sessions/columns/updated_at/alterations/alt0000001639


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN updated_at DROP DEFAULT;


