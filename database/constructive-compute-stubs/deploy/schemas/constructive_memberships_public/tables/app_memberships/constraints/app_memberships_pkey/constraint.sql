-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/constraints/app_memberships_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ADD CONSTRAINT app_memberships_pkey PRIMARY KEY (id);

