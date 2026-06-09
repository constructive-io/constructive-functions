-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_owners/alterations/alt0000000673
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_owners/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN create_child_cascade_owners SET NOT NULL;

