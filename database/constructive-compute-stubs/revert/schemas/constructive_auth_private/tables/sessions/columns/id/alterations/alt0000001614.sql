-- Revert: schemas/constructive_auth_private/tables/sessions/columns/id/alterations/alt0000001614


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN id DROP DEFAULT;


