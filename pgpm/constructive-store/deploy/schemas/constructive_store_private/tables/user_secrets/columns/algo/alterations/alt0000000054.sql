-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/algo/alterations/alt0000000054
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/algo/column


COMMENT ON COLUMN "constructive_store_private".user_secrets.algo IS E'Hash algorithm used (crypt/bcrypt)';

