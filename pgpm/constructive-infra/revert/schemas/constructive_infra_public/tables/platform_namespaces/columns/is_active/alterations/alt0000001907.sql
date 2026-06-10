-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/alterations/alt0000001907


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN is_active DROP NOT NULL;


