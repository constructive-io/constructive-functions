-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/updated_by/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ADD COLUMN updated_by uuid;

