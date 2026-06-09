-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/display_name/alterations/alt0000002293
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/display_name/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN display_name SET NOT NULL;

