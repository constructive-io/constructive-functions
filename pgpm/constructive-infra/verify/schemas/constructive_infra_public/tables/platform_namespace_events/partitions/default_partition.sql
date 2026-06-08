-- Verify: schemas/constructive_infra_public/tables/platform_namespace_events/partitions/default_partition

SELECT 1 FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'constructive_infra_public'
    AND c.relname = 'platform_namespace_events_default';
