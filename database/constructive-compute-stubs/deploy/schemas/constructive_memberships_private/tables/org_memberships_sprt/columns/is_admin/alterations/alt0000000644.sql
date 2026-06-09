-- Deploy: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_admin/alterations/alt0000000644
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/table
-- requires: schemas/constructive_memberships_private/tables/org_memberships_sprt/columns/is_admin/column


ALTER TABLE "constructive_memberships_private".org_memberships_sprt 
  ALTER COLUMN is_admin SET NOT NULL;

