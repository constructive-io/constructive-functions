-- Revert: schemas/constructive_auth_private/tables/sessions/columns/created_at/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN created_at RESTRICT;


