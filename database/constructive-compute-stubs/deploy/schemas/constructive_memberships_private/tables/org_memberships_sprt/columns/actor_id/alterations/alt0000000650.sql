-- Deploy: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/actor_id/alterations/alt0000000650
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/table
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/actor_id/column


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN actor_id SET NOT NULL;

