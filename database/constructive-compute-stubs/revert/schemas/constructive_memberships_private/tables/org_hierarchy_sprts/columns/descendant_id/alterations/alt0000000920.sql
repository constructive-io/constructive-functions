-- Revert: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/alterations/alt0000000920


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN descendant_id DROP NOT NULL;


