-- Revert: schemas/constructive_auth_private/tables/sessions/columns/origin/alterations/alt0000001623


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN origin DROP DEFAULT;


