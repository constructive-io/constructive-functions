-- Verify schemas/constructive_users_public/tables/role_types/table

BEGIN;
SELECT 1 FROM "constructive_users_public".role_types WHERE FALSE;
ROLLBACK;
