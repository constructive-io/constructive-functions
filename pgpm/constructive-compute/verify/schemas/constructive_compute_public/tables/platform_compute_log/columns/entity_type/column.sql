-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/entity_type/column
-- made with <3 @ constructive.io

BEGIN;
SELECT entity_type FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
