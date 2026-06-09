-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/alterations/alt0000001650
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN secret_hash SET NOT NULL;

