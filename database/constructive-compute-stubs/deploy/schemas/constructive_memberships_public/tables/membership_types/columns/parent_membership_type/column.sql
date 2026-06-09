-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/parent_membership_type/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table


ALTER TABLE "constructive_memberships_public".membership_types 
  ADD COLUMN parent_membership_type int;

