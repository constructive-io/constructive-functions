-- Revert: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/permissions/alterations/alt0000000647


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN permissions DROP NOT NULL;


