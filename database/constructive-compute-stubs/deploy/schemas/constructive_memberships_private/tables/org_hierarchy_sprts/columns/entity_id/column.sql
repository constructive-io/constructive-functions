-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/table


ALTER TABLE "constructive_memberships_private".org_hierarchy_sprts 
  ADD COLUMN entity_id uuid;

