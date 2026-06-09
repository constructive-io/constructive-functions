-- Deploy: schemas/constructive_auth_private/tables/identity_providers/alterations/alt0000002282
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table


ALTER TABLE "constructive_auth_private".identity_providers 
  DISABLE ROW LEVEL SECURITY;

