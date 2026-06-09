-- Deploy: schemas/constructive_auth_private/tables/sessions/alterations/alt0000001611
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table


ALTER TABLE "constructive_auth_private".sessions 
  DISABLE ROW LEVEL SECURITY;

