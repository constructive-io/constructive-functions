-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/constraints/org_memberships_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ADD CONSTRAINT org_memberships_pkey PRIMARY KEY (id);

