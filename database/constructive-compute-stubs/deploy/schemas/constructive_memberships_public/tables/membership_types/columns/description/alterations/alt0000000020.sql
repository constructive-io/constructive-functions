-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/description/alterations/alt0000000020
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/description/column


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN description SET NOT NULL;

