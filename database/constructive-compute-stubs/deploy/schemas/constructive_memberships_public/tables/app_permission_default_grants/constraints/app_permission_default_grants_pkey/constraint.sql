-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/constraints/app_permission_default_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ADD CONSTRAINT app_permission_default_grants_pkey PRIMARY KEY (id);

