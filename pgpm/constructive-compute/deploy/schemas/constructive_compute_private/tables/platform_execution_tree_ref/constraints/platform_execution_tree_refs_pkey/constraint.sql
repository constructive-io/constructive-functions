-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/constraints/platform_execution_tree_refs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ADD CONSTRAINT platform_execution_tree_refs_pkey PRIMARY KEY (created_at, id);

