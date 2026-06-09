-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/is_approved/alterations/alt0000000657
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/is_approved/column


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  ALTER COLUMN is_approved SET NOT NULL;

