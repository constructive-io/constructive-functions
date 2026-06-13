-- Deploy: schemas/constructive_compute_private/procedures/platform_tick_execution/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_tick_execution(
  IN execution_id uuid
) RETURNS integer AS $_PGFN_$
BEGIN
  RAISE EXCEPTION 'stub: replaced at provision time by graph_module';
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
