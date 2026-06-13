-- Deploy: schemas/constructive_objects_public/tables/commit/constraints/commits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table
-- requires: schemas/constructive_objects_public/tables/commit/columns/id/column
-- requires: schemas/constructive_objects_public/tables/commit/columns/database_id/column


ALTER TABLE "constructive_objects_public".commit 
  ADD CONSTRAINT commits_pkey PRIMARY KEY (id, database_id);

