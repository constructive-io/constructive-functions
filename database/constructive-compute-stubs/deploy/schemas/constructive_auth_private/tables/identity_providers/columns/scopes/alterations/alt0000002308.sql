-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/alterations/alt0000002308
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN scopes SET NOT NULL;

