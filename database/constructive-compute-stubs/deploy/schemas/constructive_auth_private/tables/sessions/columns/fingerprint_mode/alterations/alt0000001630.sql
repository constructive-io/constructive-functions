-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/fingerprint_mode/alterations/alt0000001630
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/fingerprint_mode/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN fingerprint_mode SET DEFAULT 'lax';

