-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/created_at/column


CREATE INDEX auth_rate_limits_created_at_idx ON "constructive_auth_private".auth_rate_limits ( created_at );

