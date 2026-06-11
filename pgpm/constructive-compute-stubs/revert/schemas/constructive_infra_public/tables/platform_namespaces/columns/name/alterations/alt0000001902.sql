-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/alterations/alt0000001902


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN name DROP NOT NULL;


