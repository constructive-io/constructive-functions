-- Deploy: schemas/constructive_memberships_private/tables/app_memberships_sprt/columns/permissions/alterations/alt0000000202
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/app_memberships_sprt/table
-- requires: schemas/constructive_memberships_private/tables/app_memberships_sprt/columns/permissions/column


ALTER TABLE "constructive_memberships_private".app_memberships_sprt 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

