-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/alterations/alt0000000916
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/column


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN entity_id SET NOT NULL;

