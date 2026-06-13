-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/indexes/platform_execution_tree_commits_store_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/store_id/column
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/created_at/column


CREATE INDEX platform_execution_tree_commits_store_id_created_at_idx ON "constructive_compute_private".platform_execution_tree_commit USING BTREE ( store_id, created_at );

