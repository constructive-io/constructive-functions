-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_admins/alterations/alt0000000678
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_admins/column


COMMENT ON COLUMN "constructive_memberships_public".org_membership_settings.create_child_cascade_admins IS E'When a child entity is created, whether to auto-add existing org-level admins as child-entity admins';

