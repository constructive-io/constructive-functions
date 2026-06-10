-- Verify: schemas/constructive_compute_public/tables/platform_function_definitions/fixtures/seed_built_in_functions

BEGIN;

SELECT id FROM constructive_compute_public.platform_function_definitions WHERE name = 'send-email';

ROLLBACK;
