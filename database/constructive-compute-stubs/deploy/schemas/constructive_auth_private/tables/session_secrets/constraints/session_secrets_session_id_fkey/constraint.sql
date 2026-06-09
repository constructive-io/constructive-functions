-- Deploy: schemas/constructive_auth_private/tables/session_secrets/constraints/session_secrets_session_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/column
-- requires: schemas/constructive_auth_private/tables/sessions/columns/id/column
-- requires: schemas/constructive_auth_private/tables/sessions/constraints/sessions_pkey/constraint


ALTER TABLE "constructive_auth_private".session_secrets 
  ADD CONSTRAINT session_secrets_session_id_fkey 
    FOREIGN KEY(session_id) 
    REFERENCES "constructive_auth_private".sessions (id) 
    ON DELETE CASCADE;

