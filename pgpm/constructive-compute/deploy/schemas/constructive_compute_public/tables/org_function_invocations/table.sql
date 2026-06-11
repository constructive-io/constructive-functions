-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE TABLE "constructive_compute_public".org_function_invocations (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

