-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/annotations/alterations/alt0000000103


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN annotations DROP NOT NULL;


