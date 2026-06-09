-- Deploy: schemas/constructive_auth_private/tables/session_secrets/alterations/alt0000001812
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table


ALTER TABLE "constructive_auth_private".session_secrets 
  DISABLE ROW LEVEL SECURITY;

