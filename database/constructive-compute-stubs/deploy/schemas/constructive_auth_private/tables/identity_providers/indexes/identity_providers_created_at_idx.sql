-- Deploy: schemas/constructive_auth_private/tables/identity_providers/indexes/identity_providers_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/created_at/column


CREATE INDEX identity_providers_created_at_idx ON "constructive_auth_private".identity_providers ( created_at );

