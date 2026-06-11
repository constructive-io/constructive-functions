-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/alterations/alt0000001924


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN namespace_id DROP NOT NULL;


