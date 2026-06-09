-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/alterations/alt0000000671
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN delete_member_cascade_children SET DEFAULT false;

