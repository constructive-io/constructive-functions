-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/columns/status/alterations/alt0000002164
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/status/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ADD CONSTRAINT platform_function_invocations_status_chk 
    CHECK (status IN ( 'pending', 'running', 'completed', 'failed', 'cancelled' ));

