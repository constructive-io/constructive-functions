-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/indexes/org_admin_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/grantor_id/column


CREATE INDEX org_admin_grants_grantor_id_idx ON "constructive_memberships_public".org_admin_grants USING BTREE ( grantor_id );

