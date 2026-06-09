-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/expires_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table


ALTER TABLE "constructive_auth_private".session_credentials 
  ADD COLUMN expires_at timestamptz;

