-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/alterations/alt0000000672
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/column


COMMENT ON COLUMN "constructive_memberships_public".org_membership_settings.delete_member_cascade_children IS E'When a member is deleted, whether to cascade-remove their descendant-entity memberships';

