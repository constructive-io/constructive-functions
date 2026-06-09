-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/constraints/org_admin_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ADD CONSTRAINT org_admin_grants_pkey PRIMARY KEY (id);

