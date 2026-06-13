-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/constraints/platform_function_graphs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ADD CONSTRAINT platform_function_graphs_pkey PRIMARY KEY (id);

