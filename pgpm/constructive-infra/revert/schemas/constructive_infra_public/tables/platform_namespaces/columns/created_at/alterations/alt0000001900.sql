-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/created_at/alterations/alt0000001900


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN created_at DROP DEFAULT;


