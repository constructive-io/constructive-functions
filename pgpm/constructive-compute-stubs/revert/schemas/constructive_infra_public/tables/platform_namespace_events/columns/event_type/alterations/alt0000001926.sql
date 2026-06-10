-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/alterations/alt0000001926


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN event_type DROP NOT NULL;


