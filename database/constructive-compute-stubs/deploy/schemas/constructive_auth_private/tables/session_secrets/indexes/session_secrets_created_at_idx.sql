-- Deploy: schemas/constructive_auth_private/tables/session_secrets/indexes/session_secrets_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/created_at/column


CREATE INDEX session_secrets_created_at_idx ON "constructive_auth_private".session_secrets ( created_at );

