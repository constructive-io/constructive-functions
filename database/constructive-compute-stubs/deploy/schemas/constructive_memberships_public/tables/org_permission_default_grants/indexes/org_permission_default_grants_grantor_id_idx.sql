-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_grants/indexes/org_permission_default_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/grantor_id/column


CREATE INDEX org_permission_default_grants_grantor_id_idx ON "constructive_memberships_public".org_permission_default_grants USING BTREE ( grantor_id );

