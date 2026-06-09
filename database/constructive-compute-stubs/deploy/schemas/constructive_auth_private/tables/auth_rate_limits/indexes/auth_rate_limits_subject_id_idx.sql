-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_subject_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/column


CREATE INDEX auth_rate_limits_subject_id_idx ON "constructive_auth_private".auth_rate_limits USING BTREE ( subject_id );

