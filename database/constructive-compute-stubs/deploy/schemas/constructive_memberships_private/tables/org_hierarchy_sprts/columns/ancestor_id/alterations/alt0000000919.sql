-- Deploy: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000000919
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/column


COMMENT ON COLUMN "constructive_memberships_private".org_hierarchy_sprts.ancestor_id IS E'User ID of the ancestor (manager) in the transitive path';

