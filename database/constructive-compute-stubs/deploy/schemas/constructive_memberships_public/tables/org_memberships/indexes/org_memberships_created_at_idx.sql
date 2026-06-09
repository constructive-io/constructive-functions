-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/indexes/org_memberships_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/created_at/column


CREATE INDEX org_memberships_created_at_idx ON "constructive_memberships_public".org_memberships ( created_at );

