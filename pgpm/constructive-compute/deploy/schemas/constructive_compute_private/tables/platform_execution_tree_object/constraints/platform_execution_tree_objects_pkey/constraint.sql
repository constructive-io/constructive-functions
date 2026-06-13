-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/constraints/platform_execution_tree_objects_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_object 
  ADD CONSTRAINT platform_execution_tree_objects_pkey PRIMARY KEY (created_at, id, database_id);

