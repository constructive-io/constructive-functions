-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/name/alterations/alt0000000060
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/name/column


COMMENT ON COLUMN "constructive_store_private".user_secrets.name IS E'Key name identifying the credential (e.g. password_hash)';

