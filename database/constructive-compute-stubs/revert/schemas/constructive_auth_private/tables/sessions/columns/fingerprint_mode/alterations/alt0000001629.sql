-- Revert: schemas/constructive_auth_private/tables/sessions/columns/fingerprint_mode/alterations/alt0000001629


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN fingerprint_mode DROP NOT NULL;


