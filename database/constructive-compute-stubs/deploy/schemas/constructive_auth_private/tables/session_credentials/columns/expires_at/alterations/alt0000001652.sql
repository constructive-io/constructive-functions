-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/expires_at/alterations/alt0000001652
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/expires_at/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.expires_at IS E'When this credential expires (can differ from the parent session expiration)';

