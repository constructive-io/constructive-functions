-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/skip_nonce_check/alterations/alt0000002324
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/skip_nonce_check/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN skip_nonce_check SET DEFAULT false;

