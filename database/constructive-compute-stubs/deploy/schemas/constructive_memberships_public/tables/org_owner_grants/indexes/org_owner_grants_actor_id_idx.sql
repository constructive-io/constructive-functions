-- Deploy: schemas/constructive_memberships_public/tables/org_owner_grants/indexes/org_owner_grants_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/columns/actor_id/column


CREATE INDEX org_owner_grants_actor_id_idx ON "constructive_memberships_public".org_owner_grants USING BTREE ( actor_id );

