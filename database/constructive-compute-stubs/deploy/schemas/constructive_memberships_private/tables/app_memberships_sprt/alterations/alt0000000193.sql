-- Deploy: schemas/constructive_memberships_private/tables/app_memberships_sprt/alterations/alt0000000193
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_private/schema
-- requires: schemas/constructive_memberships_private/tables/app_memberships_sprt/table


ALTER TABLE "constructive_memberships_private".app_memberships_sprt 
  DISABLE ROW LEVEL SECURITY;

