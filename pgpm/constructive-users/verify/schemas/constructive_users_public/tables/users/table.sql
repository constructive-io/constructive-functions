-- Verify schemas/constructive_users_public/tables/users/table

BEGIN;
SELECT 1 FROM "constructive_users_public".users WHERE FALSE;
ROLLBACK;
