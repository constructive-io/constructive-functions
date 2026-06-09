-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/name/alterations/alt0000001656
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/name/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.name IS E'User-provided display name for this credential (e.g. My CI Key)';

