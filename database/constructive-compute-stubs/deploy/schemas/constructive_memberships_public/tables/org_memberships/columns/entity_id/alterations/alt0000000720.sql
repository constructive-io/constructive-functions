-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/entity_id/alterations/alt0000000720
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN entity_id SET NOT NULL;

