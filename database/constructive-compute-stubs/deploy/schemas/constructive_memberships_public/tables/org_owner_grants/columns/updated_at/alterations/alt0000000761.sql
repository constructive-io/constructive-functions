-- Deploy: schemas/constructive_memberships_public/tables/org_owner_grants/columns/updated_at/alterations/alt0000000761
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ALTER COLUMN updated_at SET DEFAULT now();

