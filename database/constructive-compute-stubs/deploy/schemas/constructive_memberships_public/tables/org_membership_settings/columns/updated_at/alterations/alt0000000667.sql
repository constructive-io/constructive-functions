-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/updated_at/alterations/alt0000000667
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN updated_at SET DEFAULT now();

