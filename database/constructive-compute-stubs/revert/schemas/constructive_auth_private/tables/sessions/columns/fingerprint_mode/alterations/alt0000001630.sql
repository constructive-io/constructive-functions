-- Revert: schemas/constructive_auth_private/tables/sessions/columns/fingerprint_mode/alterations/alt0000001630


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN fingerprint_mode DROP DEFAULT;


