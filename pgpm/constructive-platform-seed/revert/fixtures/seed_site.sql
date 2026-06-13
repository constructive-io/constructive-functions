-- Revert: fixtures/seed_site

BEGIN;

DELETE FROM services_public.domains
WHERE subdomain = 'app' AND domain = 'localhost';

DELETE FROM services_public.sites
WHERE database_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
