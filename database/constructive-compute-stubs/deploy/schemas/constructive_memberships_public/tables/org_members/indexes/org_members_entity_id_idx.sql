-- Deploy: schemas/constructive_memberships_public/tables/org_members/indexes/org_members_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/column


CREATE INDEX org_members_entity_id_idx ON "constructive_memberships_public".org_members USING BTREE ( entity_id );

