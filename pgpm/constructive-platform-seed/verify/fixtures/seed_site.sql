-- Verify: fixtures/seed_site

BEGIN;

SELECT s.id, s.database_id, s.title, s.description
FROM services_public.sites s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000';

SELECT d.id, d.site_id, d.subdomain, d.domain
FROM services_public.domains d
WHERE d.subdomain = 'app' AND d.domain = 'localhost';

ROLLBACK;
