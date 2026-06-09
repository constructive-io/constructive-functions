-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/updated_at/alterations/alt0000001639
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/updated_at/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN updated_at SET DEFAULT now();

