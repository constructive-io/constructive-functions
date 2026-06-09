-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  DROP COLUMN created_at RESTRICT;


