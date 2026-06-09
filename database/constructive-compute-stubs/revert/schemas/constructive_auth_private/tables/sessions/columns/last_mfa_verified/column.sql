-- Revert: schemas/constructive_auth_private/tables/sessions/columns/last_mfa_verified/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN last_mfa_verified RESTRICT;


