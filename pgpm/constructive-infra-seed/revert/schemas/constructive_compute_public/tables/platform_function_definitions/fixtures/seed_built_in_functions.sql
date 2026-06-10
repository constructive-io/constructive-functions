-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/fixtures/seed_built_in_functions

BEGIN;

DELETE FROM constructive_compute_public.platform_function_definitions
WHERE is_built_in = true;

COMMIT;
