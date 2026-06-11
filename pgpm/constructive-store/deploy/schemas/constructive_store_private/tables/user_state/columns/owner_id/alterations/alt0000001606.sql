-- Deploy: schemas/constructive_store_private/tables/user_state/columns/owner_id/alterations/alt0000001606
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/columns/owner_id/column


COMMENT ON COLUMN "constructive_store_private".user_state.owner_id IS 'User who owns this secret';

