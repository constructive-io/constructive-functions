-- Deploy: schemas/constructive_memberships_public/tables/org_grants/columns/permissions/alterations/alt0000000788
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_grants/columns/permissions/column


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

