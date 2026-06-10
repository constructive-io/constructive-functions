-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/columns/started_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/table


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ADD COLUMN started_at timestamptz;

