-- Deploy: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_read_only/alterations/alt0000000656
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_read_only/column


COMMENT ON COLUMN "constructive_memberships_private".org_memberships_sprt.is_read_only IS E'Whether the actor has read-only access to this entity (blocks mutations when true)';

