-- Deploy: schemas/constructive_memberships_public/tables/membership_types/columns/id/alterations/alt0000000017
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/membership_types/columns/id/column


COMMENT ON COLUMN "constructive_memberships_public".membership_types.id IS E'Integer identifier for the membership type (1=App, 2=Organization, 3=Group)';

