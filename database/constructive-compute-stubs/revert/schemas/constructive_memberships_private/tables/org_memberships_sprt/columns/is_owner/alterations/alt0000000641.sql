-- Revert: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_owner/alterations/alt0000000641


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN is_owner DROP NOT NULL;


