-- Revert: schemas/constructive_auth_private/tables/sessions/columns/ip/alterations/alt0000001625


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN ip DROP DEFAULT;


