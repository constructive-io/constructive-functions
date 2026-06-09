-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/id/alterations/alt0000001642
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN id SET NOT NULL;

