-- Revert: schemas/constructive_auth_private/tables/sessions/columns/user_id/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN user_id RESTRICT;


