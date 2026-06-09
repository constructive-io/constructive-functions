-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/csrf_secret/alterations/alt0000001634
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/csrf_secret/column


COMMENT ON COLUMN "constructive_auth_private".sessions.csrf_secret IS E'Secret used to generate and validate CSRF tokens for cookie-based sessions';

