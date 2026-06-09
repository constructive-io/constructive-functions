-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/entity_id/alterations/alt0000000660
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN entity_id SET NOT NULL;

