-- Verify schemas/constructive_infra_public/tables/platform_function_definitions/fixtures/seed_built_in_functions on pg

SELECT 1 FROM constructive_infra_public.platform_function_definitions
WHERE is_built_in = true
  AND scope = 'platform'
  AND name = 'send-email';
