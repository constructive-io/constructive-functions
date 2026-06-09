-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/extra_authorization_params/alterations/alt0000002312
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/extra_authorization_params/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN extra_authorization_params SET DEFAULT '{}'::jsonb;

