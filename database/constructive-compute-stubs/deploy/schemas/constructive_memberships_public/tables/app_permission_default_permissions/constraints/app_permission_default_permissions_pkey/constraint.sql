-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_permissions/constraints/app_permission_default_permissions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_permissions/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/id/column


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  ADD CONSTRAINT app_permission_default_permissions_pkey PRIMARY KEY (id);

