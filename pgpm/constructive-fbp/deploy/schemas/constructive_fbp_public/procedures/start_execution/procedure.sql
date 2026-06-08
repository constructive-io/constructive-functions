-- Deploy: schemas/constructive_fbp_public/procedures/start_execution/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema


CREATE FUNCTION "constructive_fbp_public".start_execution(
  IN graph_id uuid,
  IN input_payload jsonb DEFAULT '{}'::jsonb,
  IN output_node text DEFAULT 'output_result',
  IN output_port text DEFAULT 'value',
  IN max_ticks integer DEFAULT 100,
  IN max_pending_jobs integer DEFAULT 50,
  IN timeout_interval interval DEFAULT interval '5 minutes',
  IN parent_execution_id uuid DEFAULT NULL,
  IN parent_node_name text DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_graph "constructive_fbp_public".function_graphs;
  v_exec_id uuid;
  v_tree_id uuid;
  v_node_row record;
  v_port_name text;
  v_input_value jsonb;
  v_node_outputs jsonb := '{}'::jsonb;
  v_output_hash bytea;
  v_obj_id uuid;
  v_output_data jsonb;
  v_prop jsonb;
  v_prop_name text;
  v_prop_value jsonb;
BEGIN
  SELECT *
  FROM "constructive_fbp_public".function_graphs
  WHERE
    id = start_execution.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_fbp_public".graph_ref AS r INNER JOIN "constructive_fbp_public".graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'no tree found for graph';
  END IF;
  FOR v_node_row IN SELECT
    path,
    data
  FROM "constructive_fbp_public".graph_get_all(v_graph.database_id, v_tree_id)
  WHERE
    ((cardinality(path) = 5 AND (path)[4] = 'nodes') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name))) AND (data->>'type') = 'graphInput' LOOP
    v_port_name := NULL;
    SELECT
      prop.value->>'value'
    FROM jsonb_array_elements(v_node_row.data->'props') AS prop (value)
    WHERE
      (prop.value->>'name') = 'portName'
    LIMIT
    1 INTO v_port_name;
    IF v_port_name IS NOT NULL AND start_execution.input_payload ? v_port_name THEN
      v_input_value := start_execution.input_payload->v_port_name;
      v_output_data := jsonb_build_object('value', v_input_value);
      v_output_hash := digest(v_output_data::text, 'sha256');
      INSERT INTO "constructive_fbp_private".function_graph_execution_outputs (
        database_id,
        hash,
        data
      )
      VALUES
        (v_graph.database_id, v_output_hash, v_output_data)
      ON CONFLICT (database_id, hash, created_at) DO NOTHING
      RETURNING id INTO v_obj_id;
      IF v_obj_id IS NULL THEN
        SELECT id
        FROM "constructive_fbp_private".function_graph_execution_outputs
        WHERE
          database_id = v_graph.database_id AND hash = v_output_hash INTO v_obj_id;
      END IF;
      v_node_outputs := v_node_outputs || jsonb_build_object((v_node_row.path)[5], v_obj_id);
    END IF;
  END LOOP;
  FOR v_node_row IN SELECT
    path,
    data
  FROM "constructive_fbp_public".graph_get_all(v_graph.database_id, v_tree_id)
  WHERE
    ((cardinality(path) = 5 AND (path)[4] = 'nodes') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name))) AND (data->>'type') = 'graphProp' LOOP
    v_prop_name := NULL;
    v_prop_value := NULL;
    IF v_node_row.data ? 'props' AND v_node_row.data->'props' IS NOT NULL THEN
      FOR v_prop IN SELECT *
      FROM jsonb_array_elements(v_node_row.data->'props') LOOP
        IF (v_prop->>'name') = 'propName' THEN
          v_prop_name := v_prop->>'value';
        END IF;
        IF (v_prop->>'name') = 'value' THEN
          v_prop_value := v_prop->'value';
        END IF;
      END LOOP;
    END IF;
    IF v_prop_name IS NOT NULL AND start_execution.input_payload ? v_prop_name THEN
      v_prop_value := start_execution.input_payload->v_prop_name;
    END IF;
    IF v_prop_value IS NOT NULL THEN
      v_output_data := jsonb_build_object('value', v_prop_value);
      v_output_hash := digest(v_output_data::text, 'sha256');
      INSERT INTO "constructive_fbp_private".function_graph_execution_outputs (
        database_id,
        hash,
        data
      )
      VALUES
        (v_graph.database_id, v_output_hash, v_output_data)
      ON CONFLICT (database_id, hash, created_at) DO NOTHING
      RETURNING id INTO v_obj_id;
      IF v_obj_id IS NULL THEN
        SELECT id
        FROM "constructive_fbp_private".function_graph_execution_outputs
        WHERE
          database_id = v_graph.database_id AND hash = v_output_hash INTO v_obj_id;
      END IF;
      v_node_outputs := v_node_outputs || jsonb_build_object((v_node_row.path)[5], v_obj_id);
    END IF;
  END LOOP;
  INSERT INTO "constructive_fbp_private".function_graph_executions (
    graph_id,
    database_id,
    output_node,
    output_port,
    input_payload,
    status,
    node_outputs,
    max_ticks,
    max_pending_jobs,
    timeout_at,
    parent_execution_id,
    parent_node_name
  )
  VALUES
    (start_execution.graph_id, v_graph.database_id, start_execution.output_node, start_execution.output_port, start_execution.input_payload, 'running', v_node_outputs, start_execution.max_ticks, start_execution.max_pending_jobs, now() + start_execution.timeout_interval, start_execution.parent_execution_id, start_execution.parent_node_name)
  RETURNING id INTO v_exec_id;
  PERFORM "constructive_fbp_private".tick_execution(v_exec_id);
  RETURN v_exec_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

