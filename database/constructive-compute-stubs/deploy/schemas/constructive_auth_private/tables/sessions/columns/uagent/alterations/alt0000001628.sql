-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/uagent/alterations/alt0000001628
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/uagent/column


COMMENT ON COLUMN "constructive_auth_private".sessions.uagent IS E'User-Agent string from the client, used for strict fingerprint validation';

