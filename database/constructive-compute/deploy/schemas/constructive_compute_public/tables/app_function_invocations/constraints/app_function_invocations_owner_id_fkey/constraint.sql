-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/constraints/app_function_invocations_owner_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/services_public/schema
-- requires: schemas/services_public/tables/apps/table
-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ADD CONSTRAINT app_function_invocations_owner_id_fkey 
    FOREIGN KEY(owner_id) 
    REFERENCES services_public.apps (id) 
    ON DELETE CASCADE;

