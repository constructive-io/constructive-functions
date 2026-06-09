-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/value/alterations/alt0000001820
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/value/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN value SET NOT NULL;

