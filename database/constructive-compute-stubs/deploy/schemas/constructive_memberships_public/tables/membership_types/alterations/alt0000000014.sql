-- Deploy: schemas/constructive_memberships_public/tables/membership_types/alterations/alt0000000014
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table


ALTER TABLE "constructive_memberships_public".membership_types 
  DISABLE ROW LEVEL SECURITY;

