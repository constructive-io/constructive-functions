-- Revert: schemas/constructive_compute_private/procedures/rollup_compute_daily
-- made with <3 @ constructive.io

BEGIN;

DROP FUNCTION IF EXISTS constructive_compute_private.rollup_compute_daily(timestamptz);

COMMIT;
