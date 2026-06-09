-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table


ALTER TABLE "constructive_auth_private".session_secrets 
  ADD COLUMN created_at timestamptz;

