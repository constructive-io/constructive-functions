-- Deploy: fixtures/seed_domain
-- made with <3 @ constructive.io

-- requires: fixtures/seed_compute_api
-- requires: services:schemas/services_public/tables/domains/table

-- Mirrors constructive-db's provision_base_modules domain structure.
-- Each subdomain maps to an API for host-based routing.

BEGIN;

-- api.localhost → public API
INSERT INTO services_public.domains (database_id, api_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  'api',
  'localhost'
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'api'
ON CONFLICT (subdomain, domain) DO UPDATE SET api_id = EXCLUDED.api_id;

-- compute.localhost → compute API
INSERT INTO services_public.domains (database_id, api_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  'compute',
  'localhost'
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'compute'
ON CONFLICT (subdomain, domain) DO UPDATE SET api_id = EXCLUDED.api_id;

-- objects.localhost → objects API
INSERT INTO services_public.domains (database_id, api_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  'objects',
  'localhost'
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'objects'
ON CONFLICT (subdomain, domain) DO UPDATE SET api_id = EXCLUDED.api_id;

-- flow.localhost → flow API
INSERT INTO services_public.domains (database_id, api_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  'flow',
  'localhost'
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'flow'
ON CONFLICT (subdomain, domain) DO UPDATE SET api_id = EXCLUDED.api_id;

COMMIT;
