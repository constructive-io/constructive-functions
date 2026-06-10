-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/namespace_id/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN namespace_id RESTRICT;


