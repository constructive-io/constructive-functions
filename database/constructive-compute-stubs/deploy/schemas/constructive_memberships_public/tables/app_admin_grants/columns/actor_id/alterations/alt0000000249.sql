-- Deploy: schemas/constructive_memberships_public/tables/app_admin_grants/columns/actor_id/alterations/alt0000000249
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/columns/actor_id/column


COMMENT ON COLUMN "constructive_memberships_public".app_admin_grants.actor_id IS E'The member receiving or losing the admin grant; NULL if user was deleted';

