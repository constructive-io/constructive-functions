-- Revert schemas/services_public/tables/pubkey_settings/table

DROP TABLE IF EXISTS "services_public".pubkey_settings CASCADE;
