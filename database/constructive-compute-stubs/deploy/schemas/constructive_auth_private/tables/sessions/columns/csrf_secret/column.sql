-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/csrf_secret/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table


ALTER TABLE "constructive_auth_private".sessions 
  ADD COLUMN csrf_secret text;

