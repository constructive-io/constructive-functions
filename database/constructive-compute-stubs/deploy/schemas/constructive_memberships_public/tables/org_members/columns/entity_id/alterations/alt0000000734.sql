-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/alterations/alt0000000734
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN entity_id SET NOT NULL;

