-- Revert: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/depth/column


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  DROP COLUMN depth RESTRICT;


