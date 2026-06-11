-- Verify: fixtures/seed_domain

BEGIN;

SELECT d.id, d.database_id, d.api_id, d.subdomain, d.domain
FROM services_public.domains d
WHERE d.domain = 'localhost'
  AND d.subdomain IN ('api', 'compute', 'objects', 'flow');

ROLLBACK;
