-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/alterations/alt0000000668
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN entity_id SET NOT NULL;

