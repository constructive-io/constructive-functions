-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/constraints/graph_commits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/table
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/id/column
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  ADD CONSTRAINT graph_commits_pkey PRIMARY KEY (id, database_id);

