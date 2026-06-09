-- Revert: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000000918


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ALTER COLUMN ancestor_id DROP NOT NULL;


