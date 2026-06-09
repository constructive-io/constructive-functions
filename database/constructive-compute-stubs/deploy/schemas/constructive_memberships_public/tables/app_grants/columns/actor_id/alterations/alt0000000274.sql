-- Deploy: schemas/constructive_memberships_public/tables/app_grants/columns/actor_id/alterations/alt0000000274
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_grants/columns/actor_id/column


COMMENT ON COLUMN "constructive_memberships_public".app_grants.actor_id IS E'The member receiving or losing the permission grant; NULL if user was deleted';

