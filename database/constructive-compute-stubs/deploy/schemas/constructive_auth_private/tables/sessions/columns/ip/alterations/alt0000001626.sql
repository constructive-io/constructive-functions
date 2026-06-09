-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/ip/alterations/alt0000001626
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/ip/column


COMMENT ON COLUMN "constructive_auth_private".sessions.ip IS E'IP address from which the session was created, used for strict fingerprint validation';

