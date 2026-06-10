-- Deploy: schemas/constructive_store_private/tables/user_state/alterations/alt0000001601
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


COMMENT ON TABLE "constructive_store_private".user_state IS E'Internal per-user state store for auth counters, tokens, and ephemeral data';

