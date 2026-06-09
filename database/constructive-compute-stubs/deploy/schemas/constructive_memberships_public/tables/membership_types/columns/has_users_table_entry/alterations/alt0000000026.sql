-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/alterations/alt0000000026
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/column


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN has_users_table_entry SET DEFAULT false;

