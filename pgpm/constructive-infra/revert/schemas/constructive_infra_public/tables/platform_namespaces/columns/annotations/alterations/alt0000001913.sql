-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/annotations/alterations/alt0000001913


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN annotations DROP NOT NULL;


