-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/expires_at/alterations/alt0000001619
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/expires_at/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN expires_at SET NOT NULL;

