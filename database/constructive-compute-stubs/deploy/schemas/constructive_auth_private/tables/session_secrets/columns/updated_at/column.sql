-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table


ALTER TABLE "constructive_auth_private".session_secrets 
  ADD COLUMN updated_at timestamptz;

