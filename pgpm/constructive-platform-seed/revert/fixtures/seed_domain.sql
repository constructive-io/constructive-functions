-- Revert: fixtures/seed_domain

BEGIN;

DELETE FROM services_public.domains
WHERE subdomain = 'graph' AND domain = 'localhost';

DELETE FROM services_public.domains
WHERE subdomain = 'compute' AND domain = 'localhost';

COMMIT;
