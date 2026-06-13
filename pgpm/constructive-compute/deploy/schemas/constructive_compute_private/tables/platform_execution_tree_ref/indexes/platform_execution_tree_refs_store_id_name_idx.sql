-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/indexes/platform_execution_tree_refs_store_id_name_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/name/column
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/store_id/column


CREATE INDEX platform_execution_tree_refs_store_id_name_idx ON "constructive_compute_private".platform_execution_tree_ref USING BTREE ( store_id, name );

