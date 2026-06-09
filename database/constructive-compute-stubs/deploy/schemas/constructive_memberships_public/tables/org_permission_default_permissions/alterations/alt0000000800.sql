-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_permissions/alterations/alt0000000800
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/table


COMMENT ON TABLE "constructive_memberships_public".org_permission_default_permissions IS E'Join table linking permission defaults to individual permissions; recompute trigger rebuilds the defaults bitmask';

