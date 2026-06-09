-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/created_at/alterations/alt0000000637


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN created_at DROP DEFAULT;


