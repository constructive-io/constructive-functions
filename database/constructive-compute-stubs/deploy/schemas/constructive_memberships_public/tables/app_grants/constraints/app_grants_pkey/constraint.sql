-- Deploy: schemas/constructive_memberships_public/tables/app_grants/constraints/app_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".app_grants 
  ADD CONSTRAINT app_grants_pkey PRIMARY KEY (id);

