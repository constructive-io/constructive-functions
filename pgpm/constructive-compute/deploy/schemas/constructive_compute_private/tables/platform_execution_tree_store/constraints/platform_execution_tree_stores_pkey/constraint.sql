-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_store/constraints/platform_execution_tree_stores_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ADD CONSTRAINT platform_execution_tree_stores_pkey PRIMARY KEY (created_at, id);

