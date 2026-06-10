-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/actor_id/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  DROP COLUMN actor_id RESTRICT;


