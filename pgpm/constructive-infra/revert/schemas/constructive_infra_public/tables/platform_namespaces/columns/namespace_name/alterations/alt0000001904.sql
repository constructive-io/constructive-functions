-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/alterations/alt0000001904


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN namespace_name DROP NOT NULL;


