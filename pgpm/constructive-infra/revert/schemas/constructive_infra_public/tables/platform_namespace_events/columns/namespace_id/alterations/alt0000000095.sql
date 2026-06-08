-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/alterations/alt0000000095


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN namespace_id DROP NOT NULL;


