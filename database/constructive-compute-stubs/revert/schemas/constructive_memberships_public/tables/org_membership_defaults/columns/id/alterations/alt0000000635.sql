-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/id/alterations/alt0000000635


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN id DROP NOT NULL;


