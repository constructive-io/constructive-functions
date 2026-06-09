-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/alterations/alt0000000026


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN has_users_table_entry DROP DEFAULT;


