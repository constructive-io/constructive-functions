-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/revoked_at/alterations/alt0000001622
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/revoked_at/column


COMMENT ON COLUMN "constructive_auth_private".sessions.revoked_at IS E'When this session was explicitly revoked (soft delete); NULL means active';

