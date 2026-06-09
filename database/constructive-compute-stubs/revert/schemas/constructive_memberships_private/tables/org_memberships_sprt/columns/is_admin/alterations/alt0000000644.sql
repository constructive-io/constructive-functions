-- Revert: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_admin/alterations/alt0000000644


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN is_admin DROP NOT NULL;


