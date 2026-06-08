-- Deploy: schemas/constructive_store_private/tables/user_secrets/alterations/alt0000000053
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


COMMENT ON TABLE "constructive_store_private".user_secrets IS E'Per-user bcrypt credential store (password hashes, API key hashes)';

