-- Revert: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_read_only/column


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  DROP COLUMN is_read_only RESTRICT;


