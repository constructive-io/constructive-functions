-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/allow_link_by_email/alterations/alt0000002320
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/table
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/allow_link_by_email/column


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN allow_link_by_email SET NOT NULL;

