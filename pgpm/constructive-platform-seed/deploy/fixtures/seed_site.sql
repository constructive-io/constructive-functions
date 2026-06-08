-- Deploy: fixtures/seed_site
-- made with <3 @ constructive.io

-- requires: fixtures/seed_database
-- requires: services:schemas/services_public/tables/sites/table
-- requires: services:schemas/services_public/tables/domains/table

BEGIN;

-- Create a platform site for branding/metadata resolution.
INSERT INTO services_public.sites (database_id, title, description)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Constructive Functions',
  'Serverless compute platform'
)
ON CONFLICT DO NOTHING;

-- Create a site domain (site-level routing, separate from the API domain).
INSERT INTO services_public.domains (database_id, site_id, subdomain, domain)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'app',
  'localhost'
FROM services_public.sites s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
ON CONFLICT (subdomain, domain) DO NOTHING;

COMMIT;
