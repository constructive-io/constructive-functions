-- Revert schemas/services_public/tables/webauthn_settings/table

DROP TABLE IF EXISTS "services_public".webauthn_settings CASCADE;
