-- Revert: grants/standalone_anon_authenticated
-- made with <3 @ constructive.io

BEGIN;

UPDATE services_public.apis
   SET anon_role = 'anonymous'
 WHERE database_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
