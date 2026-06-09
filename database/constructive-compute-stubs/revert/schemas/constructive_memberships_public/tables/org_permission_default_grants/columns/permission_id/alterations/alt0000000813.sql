-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/permission_id/alterations/alt0000000813


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN permission_id DROP NOT NULL;


