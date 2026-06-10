-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/id/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN id RESTRICT;


