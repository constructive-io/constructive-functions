-- Revert: schemas/constructive_auth_private/tables/sessions/columns/ip/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN ip RESTRICT;


