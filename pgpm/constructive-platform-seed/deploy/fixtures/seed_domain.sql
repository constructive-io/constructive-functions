-- Deploy: fixtures/seed_domain
-- made with <3 @ constructive.io

-- requires: fixtures/seed_compute_api
-- requires: services:schemas/services_public/tables/domains/table

BEGIN;

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
ON CONFLICT (subdomain, domain) DO NOTHING;

-- graph.localhost → graph API
INSERT INTO services_public.domains (database_id, api_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  'graph',
  'localhost'
FROM services_public.apis a
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'graph'
ON CONFLICT (subdomain, domain) DO NOTHING;

COMMIT;
