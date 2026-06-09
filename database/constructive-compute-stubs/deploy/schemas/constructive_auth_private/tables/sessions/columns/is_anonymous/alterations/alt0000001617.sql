-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/is_anonymous/alterations/alt0000001617
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/is_anonymous/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN is_anonymous SET DEFAULT false;

