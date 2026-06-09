-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/is_anonymous/alterations/alt0000001618
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/is_anonymous/column


COMMENT ON COLUMN "constructive_auth_private".sessions.is_anonymous IS E'Whether this is an anonymous session (no authenticated user)';

