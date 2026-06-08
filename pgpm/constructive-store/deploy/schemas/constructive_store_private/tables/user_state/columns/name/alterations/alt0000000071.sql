-- Deploy: schemas/constructive_store_private/tables/user_state/columns/name/alterations/alt0000000071
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/columns/name/column


COMMENT ON COLUMN "constructive_store_private".user_state.name IS E'Key name identifying the state entry (e.g. signin_attempts, verification_token)';

