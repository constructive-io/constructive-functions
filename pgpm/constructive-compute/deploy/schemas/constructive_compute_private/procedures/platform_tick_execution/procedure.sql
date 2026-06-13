-- Deploy: schemas/constructive_compute_private/procedures/platform_tick_execution/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_tick_execution(
  IN execution_id uuid
) RETURNS integer AS $_PGFN_$
DECLARE
  v_exec "constructive_compute_private".platform_function_graph_executions;
  v_graph "constructive_compute_public".platform_function_graphs;
  v_tree_id uuid;
  v_jobs_enqueued int := 0;
  v_nodes jsonb := '[]'::jsonb;
  v_edges jsonb := '[]'::jsonb;
  v_node_map jsonb := '{}'::jsonb;
  v_node jsonb;
  v_node_name text;
  v_node_type text;
  v_i int;
  v_is_ready boolean;
  v_edge jsonb;
  v_src_node text;
  v_src_port text;
  v_src_output jsonb;
  v_src_obj_id text;
  v_inputs jsonb;
  v_output_data jsonb;
  v_output_hash bytea;
  v_obj_id uuid;
  v_pending_jobs int;
  v_def_data jsonb;
  v_sub_graph_id uuid;
  v_node_path text[];
BEGIN
  SELECT *
  FROM "constructive_compute_private".platform_function_graph_executions
  WHERE
    id = platform_tick_execution.execution_id INTO v_exec;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'execution not found';
  END IF;
  IF v_exec.status != 'running' THEN
    RETURN 0;
  END IF;
  IF v_exec.tick_count >= v_exec.max_ticks THEN
    UPDATE "constructive_compute_private".platform_function_graph_executions SET
    status = 'failed', completed_at = now(), error_code = 'TICK_LIMIT_EXCEEDED', error_message = ('execution exceeded ' || v_exec.max_ticks) || ' ticks'
    WHERE
      id = platform_tick_execution.execution_id;
    RETURN 0;
  END IF;
  IF now() >= v_exec.timeout_at THEN
    UPDATE "constructive_compute_private".platform_function_graph_executions SET
    status = 'failed', completed_at = now(), error_code = 'EXECUTION_TIMEOUT', error_message = 'execution timed out'
    WHERE
      id = platform_tick_execution.execution_id;
    RETURN 0;
  END IF;
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = v_exec.graph_id INTO v_graph;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'no tree found for graph';
  END IF;
  FOR v_node IN SELECT jsonb_build_object('name', (path)[5], 'type', data->>'type', 'props', data->'props', 'path', to_jsonb(path))
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'nodes') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name)) LOOP
    v_nodes := v_nodes || jsonb_build_array(v_node);
    v_node_map := v_node_map || jsonb_build_object(v_node->>'name', v_node);
  END LOOP;
  FOR v_node IN SELECT data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'edges') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name))
  ORDER BY
    (path)[5]::integer LOOP
    v_edges := v_edges || jsonb_build_array(v_node);
  END LOOP;
  FOR v_i IN 0..jsonb_array_length(v_nodes) - 1 LOOP
    v_node := v_nodes->v_i;
    v_node_name := v_node->>'name';
    v_node_type := v_node->>'type';
    IF v_node_type IN ( 'graphInput', 'graphProp' ) THEN
      CONTINUE;
    END IF;
    IF v_exec.node_outputs ? v_node_name THEN
      CONTINUE;
    END IF;
    v_is_ready := true;
    v_inputs := '{}'::jsonb;
    FOR v_edge IN SELECT value
    FROM jsonb_array_elements(v_edges) AS value
    WHERE
      ((value->'dst')->>'node') = v_node_name LOOP
      v_src_node := (v_edge->'src')->>'node';
      v_src_port := (v_edge->'src')->>'port';
      IF NOT (v_exec.node_outputs ? v_src_node) THEN
        v_is_ready := false;
        EXIT;
      END IF;
      v_src_obj_id := v_exec.node_outputs->>v_src_node;
      SELECT data
      FROM "constructive_compute_private".platform_function_graph_execution_outputs
      WHERE
        id = v_src_obj_id::uuid INTO v_src_output;
      IF v_src_output IS NULL THEN
        v_is_ready := false;
        EXIT;
      END IF;
      IF v_src_output ? v_src_port THEN
        v_inputs := v_inputs || jsonb_build_object((v_edge->'dst')->>'port', v_src_output->v_src_port);
      ELSIF v_src_output ? 'value' THEN
        v_inputs := v_inputs || jsonb_build_object((v_edge->'dst')->>'port', v_src_output->'value');
      ELSE
        v_inputs := v_inputs || jsonb_build_object((v_edge->'dst')->>'port', v_src_output);
      END IF;
    END LOOP;
    IF NOT (v_is_ready) THEN
      CONTINUE;
    END IF;
    IF v_node_type = 'graphOutput' THEN
      v_output_hash := digest(v_inputs::text, 'sha256');
      INSERT INTO "constructive_compute_private".platform_function_graph_execution_outputs (
        database_id,
        hash,
        data
      )
      VALUES
        (v_exec.database_id, v_output_hash, v_inputs)
      ON CONFLICT (database_id, hash, created_at) DO NOTHING
      RETURNING id INTO v_obj_id;
      IF v_obj_id IS NULL THEN
        SELECT id
        FROM "constructive_compute_private".platform_function_graph_execution_outputs
        WHERE
          database_id = v_exec.database_id AND hash = v_output_hash INTO v_obj_id;
      END IF;
      UPDATE "constructive_compute_private".platform_function_graph_executions SET
      node_outputs = node_outputs || jsonb_build_object(v_node_name, v_obj_id)
      WHERE
        id = platform_tick_execution.execution_id
      RETURNING * INTO v_exec;
      CONTINUE;
    END IF;
    SELECT data
    FROM "constructive_platform_function_graph_public".get_node_at_path(v_graph.database_id, v_tree_id, ARRAY[v_graph.context, 'definitions', v_node_type]) AS def INTO v_def_data;
    IF v_def_data IS NULL THEN
      SELECT data
      FROM "constructive_platform_function_graph_public".get_node_at_path(v_graph.database_id, v_tree_id, ARRAY[v_graph.context, 'definitions', v_node_name]) AS def INTO v_def_data;
    END IF;
    IF v_def_data IS NOT NULL AND v_def_data ? 'graph' THEN
      SELECT "constructive_compute_public".platform_import_graph_json(v_graph.database_id, ('def_' || platform_tick_execution.execution_id) || ('_' || v_node_name), v_def_data->'graph') INTO v_sub_graph_id;
      PERFORM "constructive_compute_public".platform_start_execution(graph_id:=v_sub_graph_id, input_payload:=v_inputs, parent_execution_id:=platform_tick_execution.execution_id, parent_node_name:=v_node_name);
      v_jobs_enqueued := v_jobs_enqueued + 1;
      CONTINUE;
    END IF;
    SELECT (count(*))::integer
    FROM app_jobs.jobs
    WHERE
      (payload::jsonb->>'execution_id')::uuid = platform_tick_execution.execution_id INTO v_pending_jobs;
    IF (v_pending_jobs + v_jobs_enqueued) >= v_exec.max_pending_jobs THEN
      UPDATE "constructive_compute_private".platform_function_graph_executions SET
      status = 'failed', completed_at = now(), error_code = 'JOB_LIMIT_EXCEEDED', error_message = ('execution exceeded ' || v_exec.max_pending_jobs) || ' pending jobs'
      WHERE
        id = platform_tick_execution.execution_id;
      RETURN v_jobs_enqueued;
    END IF;
    v_node_path := ARRAY(SELECT jsonb_array_elements_text(v_node->'path'));
    INSERT INTO app_jobs.jobs (
      database_id,
      task_identifier,
      payload
    )
    VALUES
      (v_exec.database_id, v_node_type, (json_build_object('execution_id', v_exec.id, 'node_name', v_node_name, 'node_type', v_node_type, 'inputs', v_inputs, 'props', v_node->'props', 'node_path', to_jsonb(v_node_path)))::json);
    UPDATE "constructive_compute_private".platform_function_graph_executions SET
    node_outputs = node_outputs || jsonb_build_object(v_node_name, NULL)
    WHERE
      id = platform_tick_execution.execution_id
    RETURNING * INTO v_exec;
    INSERT INTO "constructive_compute_private".platform_function_graph_execution_node_states (
      execution_id,
      database_id,
      node_name,
      node_path,
      status,
      started_at
    )
    VALUES
      (v_exec.id, v_exec.database_id, v_node_name, v_node_path, 'queued', now());
    v_jobs_enqueued := v_jobs_enqueued + 1;
  END LOOP;
  UPDATE "constructive_compute_private".platform_function_graph_executions SET
  tick_count = tick_count + 1
  WHERE
    id = platform_tick_execution.execution_id;
  IF v_jobs_enqueued = 0 AND v_exec.node_outputs ? v_exec.output_node THEN
    v_src_obj_id := v_exec.node_outputs->>v_exec.output_node;
    SELECT data
    FROM "constructive_compute_private".platform_function_graph_execution_outputs
    WHERE
      id = v_src_obj_id::uuid INTO v_output_data;
    IF v_output_data IS NOT NULL THEN
      UPDATE "constructive_compute_private".platform_function_graph_executions SET
      status = 'completed', completed_at = now(), output_payload = v_output_data
      WHERE
        id = platform_tick_execution.execution_id;
      IF v_exec.parent_execution_id IS NOT NULL THEN
        PERFORM "constructive_compute_private".platform_complete_node(v_exec.parent_execution_id, v_exec.parent_node_name, v_output_data);
      END IF;
    END IF;
  END IF;
  RETURN v_jobs_enqueued;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

