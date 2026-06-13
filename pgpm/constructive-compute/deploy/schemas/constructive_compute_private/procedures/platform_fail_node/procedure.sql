-- Deploy: schemas/constructive_compute_private/procedures/platform_fail_node/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_fail_node(
  IN execution_id uuid,
  IN node_name text,
  IN error_code text,
  IN error_message text
) RETURNS void AS $_PGFN_$
DECLARE
  v_exec "constructive_compute_private".platform_function_graph_executions;
BEGIN
  SELECT *
  FROM "constructive_compute_private".platform_function_graph_executions
  WHERE
    id = platform_fail_node.execution_id INTO v_exec;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'execution not found';
  END IF;
  IF v_exec.status != 'running' THEN
    RAISE EXCEPTION 'execution is not running';
  END IF;
  UPDATE "constructive_compute_private".platform_function_graph_execution_node_states AS ns SET
  status = 'failed', completed_at = now(), error_code = platform_fail_node.error_code, error_message = platform_fail_node.error_message
  WHERE
    ns.execution_id = platform_fail_node.execution_id AND ns.node_name = platform_fail_node.node_name;
  UPDATE "constructive_compute_private".platform_function_graph_executions SET
  status = 'failed', completed_at = now(), error_code = platform_fail_node.error_code, error_message = (('[' || platform_fail_node.node_name) || '] ') || platform_fail_node.error_message
  WHERE
    id = platform_fail_node.execution_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

