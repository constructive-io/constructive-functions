-- Deploy: schemas/constructive_auth_private/tables/session_secrets/indexes/session_secrets_session_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/column


CREATE INDEX session_secrets_session_id_idx ON "constructive_auth_private".session_secrets USING BTREE ( session_id );

