-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/created_at/alterations/alt0000002329
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/created_at/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN created_at SET DEFAULT now();

