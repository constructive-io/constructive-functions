-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/id/alterations/alt0000002284
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/id/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN id SET NOT NULL;

