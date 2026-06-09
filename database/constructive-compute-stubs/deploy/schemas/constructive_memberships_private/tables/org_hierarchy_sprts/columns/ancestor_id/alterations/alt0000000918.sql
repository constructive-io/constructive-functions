-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000000918
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/column


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN ancestor_id SET NOT NULL;

