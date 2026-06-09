-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001635
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/auth_method/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN auth_method SET NOT NULL;

