-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ADD COLUMN limit_allocation_mode text;

