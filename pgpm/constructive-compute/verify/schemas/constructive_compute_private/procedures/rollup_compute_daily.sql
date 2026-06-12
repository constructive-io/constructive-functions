-- Verify: schemas/constructive_compute_private/procedures/rollup_compute_daily
-- made with <3 @ constructive.io

BEGIN;

SELECT has_function_privilege(
  'constructive_compute_private.rollup_compute_daily(timestamptz)',
  'execute'
);

ROLLBACK;
