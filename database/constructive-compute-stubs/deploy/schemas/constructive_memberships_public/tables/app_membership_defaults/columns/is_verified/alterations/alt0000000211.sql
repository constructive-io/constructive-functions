-- Deploy: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_verified/alterations/alt0000000211
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_verified/column


COMMENT ON COLUMN "constructive_memberships_public".app_membership_defaults.is_verified IS 'Whether new members are automatically verified upon joining';

