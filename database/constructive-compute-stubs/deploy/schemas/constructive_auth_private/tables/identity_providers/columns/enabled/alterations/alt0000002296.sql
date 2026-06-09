-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/enabled/alterations/alt0000002296
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/enabled/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN enabled SET DEFAULT true;

