-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ADD COLUMN actor_id uuid;

