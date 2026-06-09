-- Deploy: schemas/constructive_memberships_private/tables/app_memberships_sprt/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/app_memberships_sprt/table


ALTER TABLE "constructive_memberships_private".app_memberships_sprt 
  ADD COLUMN actor_id uuid;

