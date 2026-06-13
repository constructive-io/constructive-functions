-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/alterations/alt0000001948
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/column


COMMENT ON COLUMN "constructive_store_private".user_secrets.owner_id IS 'User who owns this credential';

