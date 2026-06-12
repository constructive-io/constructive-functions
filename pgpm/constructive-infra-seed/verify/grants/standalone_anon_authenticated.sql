-- Verify: grants/standalone_anon_authenticated
-- made with <3 @ constructive.io

BEGIN;

SELECT 1/count(*)::int
  FROM services_public.apis
 WHERE database_id = '00000000-0000-0000-0000-000000000000'
   AND anon_role = 'authenticated';

ROLLBACK;
