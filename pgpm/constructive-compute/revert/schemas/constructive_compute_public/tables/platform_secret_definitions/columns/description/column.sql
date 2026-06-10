-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/description/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DROP COLUMN description RESTRICT;


