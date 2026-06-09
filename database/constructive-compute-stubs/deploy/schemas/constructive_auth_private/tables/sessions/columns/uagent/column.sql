-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/uagent/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table


ALTER TABLE "constructive_auth_private".sessions 
  ADD COLUMN uagent text;

