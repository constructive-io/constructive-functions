-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_grants/constraints/org_permission_default_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ADD CONSTRAINT org_permission_default_grants_pkey PRIMARY KEY (id);

