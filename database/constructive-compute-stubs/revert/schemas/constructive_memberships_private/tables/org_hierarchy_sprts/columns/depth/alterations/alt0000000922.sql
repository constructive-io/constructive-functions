-- Revert: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/depth/alterations/alt0000000922


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN depth DROP NOT NULL;


