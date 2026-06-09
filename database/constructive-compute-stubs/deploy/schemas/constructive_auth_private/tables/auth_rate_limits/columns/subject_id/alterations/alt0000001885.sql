-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/alterations/alt0000001885
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/column


COMMENT ON COLUMN "constructive_auth_private".auth_rate_limits.subject_id IS 'UUID of the user or entity being rate limited';

