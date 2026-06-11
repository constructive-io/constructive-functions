-- Revert schemas/services_public/tables/rls_settings/table

DROP TABLE IF EXISTS "services_public".rls_settings CASCADE;
