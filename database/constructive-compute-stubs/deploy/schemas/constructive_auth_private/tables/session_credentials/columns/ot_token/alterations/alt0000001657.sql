-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/ot_token/alterations/alt0000001657
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/ot_token/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.ot_token IS E'One-time token for magic link or passwordless authentication flows';

