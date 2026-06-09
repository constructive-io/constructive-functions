-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/parent_membership_type/alterations/alt0000000024
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/parent_membership_type/column


COMMENT ON COLUMN "constructive_memberships_public".membership_types.parent_membership_type IS E'Parent membership type ID for SPRT cascade chain (e.g. type 2 parent=1, type 3 parent=2)';

