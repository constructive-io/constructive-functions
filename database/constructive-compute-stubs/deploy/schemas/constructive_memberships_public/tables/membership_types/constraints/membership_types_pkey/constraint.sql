-- Deploy: schemas/constructive_memberships_public/tables/membership_types/constraints/membership_types_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/id/column


ALTER TABLE "constructive_memberships_public".membership_types 
  ADD CONSTRAINT membership_types_pkey PRIMARY KEY (id);

