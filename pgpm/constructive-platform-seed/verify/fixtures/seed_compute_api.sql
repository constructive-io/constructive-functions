-- Verify: fixtures/seed_compute_api

BEGIN;

-- Verify compute API
SELECT a.id, a.name, a.role_name, a.anon_role, a.is_public
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'compute';

SELECT aps.id, aps.api_id, aps.schema_id
FROM services_public.api_schemas aps
JOIN services_public.apis a ON a.id = aps.api_id
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'compute';

-- Verify graph API
SELECT a.id, a.name, a.role_name, a.anon_role, a.is_public
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'graph';

SELECT aps.id, aps.api_id, aps.schema_id
FROM services_public.api_schemas aps
JOIN services_public.apis a ON a.id = aps.api_id
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'graph';

ROLLBACK;
