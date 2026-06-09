-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/columns/entity_id/alterations/alt0000000745
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/entity_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_admin_grants.entity_id IS E'The entity (org or group) this admin grant applies to';

