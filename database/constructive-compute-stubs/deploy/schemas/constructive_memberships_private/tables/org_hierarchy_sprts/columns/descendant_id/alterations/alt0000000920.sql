-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/alterations/alt0000000920
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/column


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN descendant_id SET NOT NULL;

