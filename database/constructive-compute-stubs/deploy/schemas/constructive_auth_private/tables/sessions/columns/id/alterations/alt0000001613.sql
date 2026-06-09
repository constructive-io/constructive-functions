-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/id/alterations/alt0000001613
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/id/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN id SET NOT NULL;

