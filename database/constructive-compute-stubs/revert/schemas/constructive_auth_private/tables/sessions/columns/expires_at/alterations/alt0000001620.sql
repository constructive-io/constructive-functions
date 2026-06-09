-- Revert: schemas/constructive_auth_private/tables/sessions/columns/expires_at/alterations/alt0000001620


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN expires_at DROP DEFAULT;


