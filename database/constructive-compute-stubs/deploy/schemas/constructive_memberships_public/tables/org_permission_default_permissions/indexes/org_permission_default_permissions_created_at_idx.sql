-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_permissions/indexes/org_permission_default_permissions_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/created_at/column


CREATE INDEX org_permission_default_permissions_created_at_idx ON "constructive_memberships_public".org_permission_default_permissions ( created_at );

