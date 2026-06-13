-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/constraints/platform_secret_definitions_name_key/constraint


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DROP CONSTRAINT platform_secret_definitions_name_key;


