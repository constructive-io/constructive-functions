-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/alterations/alt0000000087


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP CONSTRAINT platform_namespace_events_event_type_chk;


