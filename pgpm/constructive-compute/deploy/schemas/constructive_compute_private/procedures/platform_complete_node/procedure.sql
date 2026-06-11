-- Deploy: schemas/constructive_compute_private/procedures/platform_complete_node/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_complete_node(
  IN execution_id uuid,
  IN node_name text,
  IN output_data jsonb
) RETURNS void AS $_PGFN_$
DECLARE
  v_exec "constructive_compute_private".platform_function_graph_executions;
  v_output_hash bytea;
  v_obj_id uuid;
BEGIN
  SELECT *
  FROM "constructive_compute_private".platform_function_graph_executions
  WHERE
    id = platform_complete_node.execution_id INTO v_exec;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'execution not found';
  END IF;
  IF v_exec.status != 'running' THEN
    RAISE EXCEPTION 'execution is not running';
  END IF;
  v_output_hash := digest(platform_complete_node.output_data::text, 'sha256');
  INSERT INTO "constructive_compute_private".platform_function_graph_execution_outputs (
    database_id,
    hash,
    data
  )
  VALUES
    (v_exec.database_id, v_output_hash, platform_complete_node.output_data)
  ON CONFLICT (database_id, hash, created_at) DO NOTHING
  RETURNING id INTO v_obj_id;
  IF v_obj_id IS NULL THEN
    SELECT id
    FROM "constructive_compute_private".platform_function_graph_execution_outputs
    WHERE
      database_id = v_exec.database_id AND hash = v_output_hash INTO v_obj_id;
  END IF;
  UPDATE "constructive_compute_private".platform_function_graph_executions SET
  node_outputs = node_outputs || jsonb_build_object(platform_complete_node.node_name, v_obj_id)
  WHERE
    id = platform_complete_node.execution_id;
  PERFORM "constructive_compute_private".platform_tick_execution(platform_complete_node.execution_id);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

