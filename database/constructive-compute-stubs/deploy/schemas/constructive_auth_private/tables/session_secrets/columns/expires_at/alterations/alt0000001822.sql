-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/expires_at/alterations/alt0000001822
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/expires_at/column


COMMENT ON COLUMN "constructive_auth_private".session_secrets.expires_at IS E'Per-row TTL. NULL means the row lives until the parent session is hard-deleted or explicit cleanup runs.';

