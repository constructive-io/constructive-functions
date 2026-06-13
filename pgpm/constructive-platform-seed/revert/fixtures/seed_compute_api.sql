-- Revert: fixtures/seed_compute_api

BEGIN;

DELETE FROM services_public.api_schemas
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND api_id IN (
    SELECT id FROM services_public.apis
    WHERE database_id = '00000000-0000-0000-0000-000000000000'
      AND name IN ('api', 'compute', 'objects', 'flow')
  );

DELETE FROM services_public.apis
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name IN ('api', 'compute', 'objects', 'flow');

COMMIT;
