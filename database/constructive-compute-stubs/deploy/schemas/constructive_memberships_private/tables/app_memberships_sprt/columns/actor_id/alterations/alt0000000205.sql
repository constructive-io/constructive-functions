-- Deploy: schemas/constructive_memberships_private/tables/app_memberships_sprt/columns/actor_id/alterations/alt0000000205
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/app_memberships_sprt/columns/actor_id/column


COMMENT ON COLUMN "constructive_memberships_private".app_memberships_sprt.actor_id IS 'References the user whose permissions are being resolved';

