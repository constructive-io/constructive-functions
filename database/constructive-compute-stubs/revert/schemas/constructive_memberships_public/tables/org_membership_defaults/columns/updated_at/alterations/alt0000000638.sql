-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/updated_at/alterations/alt0000000638


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN updated_at DROP DEFAULT;


