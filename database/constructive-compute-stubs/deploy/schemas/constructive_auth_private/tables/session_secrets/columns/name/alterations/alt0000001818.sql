-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/name/alterations/alt0000001818
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/name/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN name SET NOT NULL;

