-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/alterations/alt0000000669
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_membership_settings.entity_id IS 'References the entity these settings apply to';

