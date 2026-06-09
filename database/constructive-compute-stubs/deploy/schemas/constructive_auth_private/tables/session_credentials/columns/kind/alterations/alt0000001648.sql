-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/kind/alterations/alt0000001648
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/kind/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.kind IS E'Credential type: bearer (JWT), cookie, api_key, or magic_link';

