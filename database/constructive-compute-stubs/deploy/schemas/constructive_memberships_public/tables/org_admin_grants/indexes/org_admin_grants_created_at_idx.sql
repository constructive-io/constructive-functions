-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/indexes/org_admin_grants_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/created_at/column


CREATE INDEX org_admin_grants_created_at_idx ON "constructive_memberships_public".org_admin_grants ( created_at );

