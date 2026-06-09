-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/value/alterations/alt0000001821
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/value/column


COMMENT ON COLUMN "constructive_auth_private".session_secrets.value IS E'The secret payload; use base64url for binary data';

