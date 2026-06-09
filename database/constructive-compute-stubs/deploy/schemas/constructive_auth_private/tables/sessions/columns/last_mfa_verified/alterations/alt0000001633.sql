-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/last_mfa_verified/alterations/alt0000001633
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/last_mfa_verified/column


COMMENT ON COLUMN "constructive_auth_private".sessions.last_mfa_verified IS E'Timestamp of last MFA verification for step-up authentication';

