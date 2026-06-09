-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/is_approved/alterations/alt0000000657


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN is_approved DROP NOT NULL;


