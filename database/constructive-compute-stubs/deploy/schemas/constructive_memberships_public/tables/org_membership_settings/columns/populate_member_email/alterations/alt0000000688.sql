-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/populate_member_email/alterations/alt0000000688
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/populate_member_email/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN populate_member_email SET NOT NULL;

