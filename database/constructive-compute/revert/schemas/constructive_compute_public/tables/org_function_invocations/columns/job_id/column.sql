-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/job_id/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN job_id RESTRICT;


