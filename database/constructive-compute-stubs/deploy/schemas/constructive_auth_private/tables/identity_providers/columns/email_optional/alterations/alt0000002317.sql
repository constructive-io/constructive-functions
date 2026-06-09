-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/alterations/alt0000002317
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN email_optional SET NOT NULL;

