-- Deploy: schemas/constructive_memberships_public/tables/org_grants/constraints/org_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_grants 
  ADD CONSTRAINT org_grants_pkey PRIMARY KEY (id);

