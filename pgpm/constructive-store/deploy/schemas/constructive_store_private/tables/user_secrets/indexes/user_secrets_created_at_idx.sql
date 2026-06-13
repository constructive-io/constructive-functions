-- Deploy: schemas/constructive_store_private/tables/user_secrets/indexes/user_secrets_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/created_at/column


CREATE INDEX user_secrets_created_at_idx ON "constructive_store_private".user_secrets ( created_at );

