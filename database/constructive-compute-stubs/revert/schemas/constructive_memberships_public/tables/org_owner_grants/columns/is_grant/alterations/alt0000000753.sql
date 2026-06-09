-- Revert: schemas/constructive_memberships_public/tables/org_owner_grants/columns/is_grant/alterations/alt0000000753


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


