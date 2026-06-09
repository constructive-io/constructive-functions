-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/session_id/alterations/alt0000001644
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/session_id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN session_id SET NOT NULL;

