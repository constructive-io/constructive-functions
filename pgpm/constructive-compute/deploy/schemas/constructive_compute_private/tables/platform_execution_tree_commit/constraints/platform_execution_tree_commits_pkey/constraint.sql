-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/constraints/platform_execution_tree_commits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ADD CONSTRAINT platform_execution_tree_commits_pkey PRIMARY KEY (created_at, id);

