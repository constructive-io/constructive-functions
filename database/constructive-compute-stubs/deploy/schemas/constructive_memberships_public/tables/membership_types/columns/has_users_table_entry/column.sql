-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/table


ALTER TABLE "constructive_memberships_public".membership_types 
  ADD COLUMN has_users_table_entry boolean;

