-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/labels/alterations/alt0000001910


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN labels DROP NOT NULL;


