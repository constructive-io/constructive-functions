-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_admins/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ADD COLUMN create_child_cascade_admins boolean;

