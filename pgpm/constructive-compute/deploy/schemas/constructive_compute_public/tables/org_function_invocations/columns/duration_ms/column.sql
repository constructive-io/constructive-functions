-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/duration_ms/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/table


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ADD COLUMN duration_ms integer;

