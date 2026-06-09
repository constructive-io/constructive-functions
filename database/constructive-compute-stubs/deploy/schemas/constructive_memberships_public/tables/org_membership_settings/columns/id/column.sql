-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ADD COLUMN id uuid;

