-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  DROP COLUMN updated_at RESTRICT;


