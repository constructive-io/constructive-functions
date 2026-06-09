-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/org_id/alterations/alt0000001655
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/org_id/column


COMMENT ON COLUMN "constructive_auth_private".session_credentials.org_id IS E'Scopes this API key to a specific organization; NULL means app-level';

