-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/alterations/alt0000001823
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN created_at SET DEFAULT now();

