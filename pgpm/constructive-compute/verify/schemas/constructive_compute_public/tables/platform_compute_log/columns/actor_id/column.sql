-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/actor_id/column
-- made with <3 @ constructive.io

BEGIN;
SELECT actor_id FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
