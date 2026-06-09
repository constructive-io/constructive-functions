-- Deploy: schemas/constructive_auth_private/tables/identity_providers/constraints/identity_providers_slug_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/slug/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ADD CONSTRAINT identity_providers_slug_key 
    UNIQUE (slug);

