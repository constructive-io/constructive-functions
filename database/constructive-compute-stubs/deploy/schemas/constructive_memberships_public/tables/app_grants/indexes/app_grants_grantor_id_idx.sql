-- Deploy: schemas/constructive_memberships_public/tables/app_grants/indexes/app_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_grants/columns/grantor_id/column


CREATE INDEX app_grants_grantor_id_idx ON "constructive_memberships_public".app_grants USING BTREE ( grantor_id );

