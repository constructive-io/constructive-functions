-- Deploy: grants/standalone_anon_authenticated
-- made with <3 @ constructive.io
--
-- In standalone dev mode there is no JWT authentication layer.
-- Set anon_role to 'authenticated' so all requests (even without a token)
-- execute as the authenticated role instead of anonymous.

BEGIN;

UPDATE services_public.apis
   SET anon_role = 'authenticated'
 WHERE database_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
