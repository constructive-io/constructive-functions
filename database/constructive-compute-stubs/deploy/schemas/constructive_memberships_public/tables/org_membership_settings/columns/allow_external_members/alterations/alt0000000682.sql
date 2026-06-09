-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/allow_external_members/alterations/alt0000000682
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/allow_external_members/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN allow_external_members SET NOT NULL;

