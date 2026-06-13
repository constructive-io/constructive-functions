-- Verify schemas/services_public/tables/pubkey_settings/table

BEGIN;
SELECT 1 FROM "services_public".pubkey_settings WHERE FALSE;
ROLLBACK;
