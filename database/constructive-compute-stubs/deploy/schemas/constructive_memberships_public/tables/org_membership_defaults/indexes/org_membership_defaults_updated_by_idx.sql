-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/indexes/org_membership_defaults_updated_by_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/updated_by/column


CREATE INDEX org_membership_defaults_updated_by_idx ON "constructive_memberships_public".org_membership_defaults ( updated_by );

