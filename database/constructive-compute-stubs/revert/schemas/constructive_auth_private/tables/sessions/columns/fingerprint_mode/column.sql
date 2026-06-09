-- Revert: schemas/constructive_auth_private/tables/sessions/columns/fingerprint_mode/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN fingerprint_mode RESTRICT;


