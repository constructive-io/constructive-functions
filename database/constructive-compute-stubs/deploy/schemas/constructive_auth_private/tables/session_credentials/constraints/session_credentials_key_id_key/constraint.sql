-- Deploy: schemas/constructive_auth_private/tables/session_credentials/constraints/session_credentials_key_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/key_id/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ADD CONSTRAINT session_credentials_key_id_key 
    UNIQUE (key_id);

