-- Deploy: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/permissions/alterations/alt0000000648
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/table
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/permissions/column


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

