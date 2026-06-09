-- Deploy: schemas/constructive_memberships_private/tables/org_memberships_sprt/indexes/org_memberships_sprts_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/table
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/actor_id/column
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_admin/column
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_owner/column
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/permissions/column
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_read_only/column


CREATE INDEX org_memberships_sprts_actor_id_idx ON "constructive_memberships_private".org_memberships_sprt USING BTREE ( actor_id ) INCLUDE ( permissions, is_owner, is_admin, is_read_only );

