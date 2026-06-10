-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/actor_id/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN actor_id RESTRICT;


