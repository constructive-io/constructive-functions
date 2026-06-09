-- Deploy: schemas/constructive_auth_private/tables/sessions/alterations/alt0000001612
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table


COMMENT ON TABLE "constructive_auth_private".sessions IS E'Tracks user authentication sessions with expiration, fingerprinting, and step-up verification state';

