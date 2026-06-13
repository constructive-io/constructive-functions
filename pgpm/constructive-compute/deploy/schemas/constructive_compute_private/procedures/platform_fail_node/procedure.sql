-- Deploy: schemas/constructive_compute_private/procedures/platform_fail_node/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_fail_node(
  IN execution_id uuid,
  IN node_name text,
  IN error_code text,
  IN error_message text
) RETURNS void AS $_PGFN_$
BEGIN
  RAISE EXCEPTION 'stub: replaced at provision time by graph_module';
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

