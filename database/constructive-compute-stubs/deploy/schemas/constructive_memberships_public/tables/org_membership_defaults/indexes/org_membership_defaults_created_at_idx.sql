-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/indexes/org_membership_defaults_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/created_at/column


CREATE INDEX org_membership_defaults_created_at_idx ON "constructive_memberships_public".org_membership_defaults ( created_at );

