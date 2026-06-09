-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/kind/alterations/alt0000002291
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/kind/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN kind SET NOT NULL;

