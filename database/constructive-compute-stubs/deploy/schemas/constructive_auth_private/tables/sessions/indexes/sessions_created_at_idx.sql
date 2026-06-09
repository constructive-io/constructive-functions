-- Deploy: schemas/constructive_auth_private/tables/sessions/indexes/sessions_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/created_at/column


CREATE INDEX sessions_created_at_idx ON "constructive_auth_private".sessions ( created_at );

