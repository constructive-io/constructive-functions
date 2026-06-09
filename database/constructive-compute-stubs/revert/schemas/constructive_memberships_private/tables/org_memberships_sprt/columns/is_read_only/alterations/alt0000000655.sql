-- Revert: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_read_only/alterations/alt0000000655


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN is_read_only DROP DEFAULT;


