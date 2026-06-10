-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/parent_invocation_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/table


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ADD COLUMN parent_invocation_id uuid;

