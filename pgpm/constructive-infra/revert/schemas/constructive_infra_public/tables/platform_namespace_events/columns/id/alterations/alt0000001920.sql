-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/id/alterations/alt0000001920


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN id DROP NOT NULL;


