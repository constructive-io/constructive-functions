-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/actor_id/column


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  DROP COLUMN actor_id RESTRICT;


