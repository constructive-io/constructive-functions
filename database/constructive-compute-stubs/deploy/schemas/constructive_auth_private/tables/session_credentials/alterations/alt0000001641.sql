-- Deploy: schemas/constructive_auth_private/tables/session_credentials/alterations/alt0000001641
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table


COMMENT ON TABLE "constructive_auth_private".session_credentials IS E'Authentication credentials (bearer tokens, cookies, API keys, magic links) tied to sessions';

