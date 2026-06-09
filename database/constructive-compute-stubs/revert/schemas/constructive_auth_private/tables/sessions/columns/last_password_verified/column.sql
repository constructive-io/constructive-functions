-- Revert: schemas/constructive_auth_private/tables/sessions/columns/last_password_verified/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN last_password_verified RESTRICT;


