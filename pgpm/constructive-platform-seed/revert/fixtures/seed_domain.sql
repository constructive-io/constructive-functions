-- Revert: fixtures/seed_domain

BEGIN;

DELETE FROM services_public.domains
WHERE subdomain = 'compute' AND domain = 'localhost';

COMMIT;
