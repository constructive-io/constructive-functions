-- Revert schemas/services_public/tables/cors_settings/table

DROP TABLE IF EXISTS "services_public".cors_settings CASCADE;
