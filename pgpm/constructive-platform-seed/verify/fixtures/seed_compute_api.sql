-- Verify: fixtures/seed_compute_api

BEGIN;

SELECT a.id, a.name, a.role_name, a.anon_role, a.is_public
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name IN ('api', 'compute', 'objects', 'flow');

SELECT a.name AS api_name, s.schema_name
FROM services_public.api_schemas aps
JOIN services_public.apis a ON a.id = aps.api_id
JOIN metaschema_public.schema s ON s.id = aps.schema_id
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name IN ('api', 'compute', 'objects')
ORDER BY a.name, s.schema_name;

ROLLBACK;
