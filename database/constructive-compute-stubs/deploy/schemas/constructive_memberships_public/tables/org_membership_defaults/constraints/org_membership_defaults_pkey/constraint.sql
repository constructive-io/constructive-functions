-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/constraints/org_membership_defaults_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/id/column


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ADD CONSTRAINT org_membership_defaults_pkey PRIMARY KEY (id);

