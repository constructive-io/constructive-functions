-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/alterations/alt0000000027
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/has_users_table_entry/column


COMMENT ON COLUMN "constructive_memberships_public".membership_types.has_users_table_entry IS E'When true, entities of this membership type get a one-to-one ID in the users table and a corresponding role_type entry, enabling them to own resources via owner_id FKs';

