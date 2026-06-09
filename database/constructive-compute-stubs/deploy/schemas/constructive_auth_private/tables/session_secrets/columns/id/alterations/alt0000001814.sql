-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/id/alterations/alt0000001814
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/id/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN id SET NOT NULL;

