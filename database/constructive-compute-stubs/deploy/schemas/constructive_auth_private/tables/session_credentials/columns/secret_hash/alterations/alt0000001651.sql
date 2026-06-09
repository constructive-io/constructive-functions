-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/alterations/alt0000001651
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/secret_hash/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.secret_hash IS E'SHA-256 hash of the credential secret; the plaintext secret is never stored';

