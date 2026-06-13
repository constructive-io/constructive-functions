-- Revert: fixtures/seed_domain

BEGIN;

DELETE FROM services_public.domains
WHERE domain = 'localhost'
  AND subdomain IN ('api', 'compute', 'objects', 'flow');

COMMIT;
