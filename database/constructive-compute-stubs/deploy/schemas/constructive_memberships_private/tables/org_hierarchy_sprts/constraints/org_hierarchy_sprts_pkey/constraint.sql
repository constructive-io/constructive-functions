-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/constraints/org_hierarchy_sprts_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/column
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/column
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/column


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ADD CONSTRAINT org_hierarchy_sprts_pkey PRIMARY KEY (entity_id, ancestor_id, descendant_id);

