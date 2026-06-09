-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/indexes/app_permission_default_grants_permission_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/permission_id/column


CREATE INDEX app_permission_default_grants_permission_id_idx ON "constructive_memberships_public".app_permission_default_grants USING BTREE ( permission_id );

