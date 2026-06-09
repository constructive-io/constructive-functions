-- Revert: schemas/constructive_auth_private/tables/sessions/columns/revoked_at/column


ALTER TABLE "constructive_auth_private".sessions 
  DROP COLUMN revoked_at RESTRICT;


