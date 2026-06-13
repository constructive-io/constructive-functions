-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/constraints/org_function_invocations_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/table


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ADD CONSTRAINT org_function_invocations_pkey PRIMARY KEY (created_at, id);

