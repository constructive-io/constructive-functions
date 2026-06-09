-- Revert: schemas/constructive_auth_private/tables/sessions/columns/csrf_secret/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN csrf_secret RESTRICT;


