-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/indexes/org_member_profiles_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/column


CREATE INDEX org_member_profiles_actor_id_idx ON "constructive_memberships_public".org_member_profiles USING BTREE ( actor_id );

