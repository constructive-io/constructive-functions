-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/indexes/org_membership_settings_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/created_at/column


CREATE INDEX org_membership_settings_created_at_idx ON "constructive_memberships_public".org_membership_settings ( created_at );

