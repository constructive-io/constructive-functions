-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/value/alterations/alt0000001951
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/value/column


COMMENT ON COLUMN "constructive_store_private".user_secrets.value IS E'The bcrypt-hashed credential value stored as binary';

