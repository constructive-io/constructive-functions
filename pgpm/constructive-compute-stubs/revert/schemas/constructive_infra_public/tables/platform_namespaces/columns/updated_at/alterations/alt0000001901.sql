-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/alterations/alt0000001901


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN updated_at DROP DEFAULT;


