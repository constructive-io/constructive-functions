-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/scope/alterations/alt0000000022
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/scope/column


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN scope SET NOT NULL;

