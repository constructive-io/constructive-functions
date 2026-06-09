-- Deploy: schemas/constructive_auth_private/tables/session_secrets/constraints/session_secrets_session_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/column
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/name/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ADD CONSTRAINT session_secrets_session_id_name_key 
    UNIQUE (session_id, name);

