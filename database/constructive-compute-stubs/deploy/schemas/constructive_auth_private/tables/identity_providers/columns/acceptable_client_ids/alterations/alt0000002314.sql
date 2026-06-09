-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/acceptable_client_ids/alterations/alt0000002314
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/acceptable_client_ids/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN acceptable_client_ids SET NOT NULL;

