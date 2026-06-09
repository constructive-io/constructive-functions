-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/pkce_enabled/alterations/alt0000002327
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/pkce_enabled/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN pkce_enabled SET DEFAULT true;

