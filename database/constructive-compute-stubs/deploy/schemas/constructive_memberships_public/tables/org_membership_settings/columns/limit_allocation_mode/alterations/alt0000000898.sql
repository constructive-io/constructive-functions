-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/alterations/alt0000000898
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN limit_allocation_mode SET DEFAULT 'pooled';

