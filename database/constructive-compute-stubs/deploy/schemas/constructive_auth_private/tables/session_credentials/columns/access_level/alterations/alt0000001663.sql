-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/alterations/alt0000001663
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.access_level IS E'Access level for this credential: full_access (read+write) or read_only (SET TRANSACTION READ ONLY)';

