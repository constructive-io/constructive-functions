-- Verify schemas/services_public/tables/webauthn_settings/table

BEGIN;
SELECT 1 FROM "services_public".webauthn_settings WHERE FALSE;
ROLLBACK;
