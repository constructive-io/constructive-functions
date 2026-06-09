-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/created_at/alterations/alt0000001638
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/created_at/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN created_at SET DEFAULT now();

