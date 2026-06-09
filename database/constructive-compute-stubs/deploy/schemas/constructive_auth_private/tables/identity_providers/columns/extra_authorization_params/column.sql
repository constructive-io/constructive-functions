-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/extra_authorization_params/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table


ALTER TABLE "constructive_auth_private".identity_providers 
  ADD COLUMN extra_authorization_params jsonb;

