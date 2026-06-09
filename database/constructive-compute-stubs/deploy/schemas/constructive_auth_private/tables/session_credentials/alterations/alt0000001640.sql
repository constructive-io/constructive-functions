-- Deploy: schemas/constructive_auth_private/tables/session_credentials/alterations/alt0000001640
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table


ALTER TABLE "constructive_auth_private".session_credentials 
  DISABLE ROW LEVEL SECURITY;

