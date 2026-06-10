-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/is_built_in/alterations/alt0000002091


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN is_built_in DROP DEFAULT;


