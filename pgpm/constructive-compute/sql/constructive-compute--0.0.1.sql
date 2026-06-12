\echo Use "CREATE EXTENSION constructive-compute" to load this file. \quit
CREATE SCHEMA constructive_compute_private;

CREATE FUNCTION constructive_compute_private.platform_complete_node(
  IN execution_id uuid,
  IN node_name text,
  IN output_data jsonb
) RETURNS void AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_private.platform_copy_subtree(
  IN source_scope_id uuid,
  IN source_commit_id uuid,
  IN source_path text[],
  IN target_scope_id uuid,
  IN target_root_hash uuid,
  IN target_path text[]
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_source_tree_id uuid;
  v_root_hash uuid;
  v_row record;
  v_rel_path text[];
  v_new_path text[];
  v_src_len int;
BEGIN
  SELECT tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_commit
  WHERE
    id = platform_copy_subtree.source_commit_id AND database_id = platform_copy_subtree.source_scope_id INTO v_source_tree_id;
  IF v_source_tree_id IS NULL THEN
    RAISE EXCEPTION 'source commit not found';
  END IF;
  v_src_len := cardinality(platform_copy_subtree.source_path);
  v_root_hash := platform_copy_subtree.target_root_hash;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(platform_copy_subtree.source_scope_id, v_source_tree_id)
  WHERE
    (path)[1:v_src_len] = platform_copy_subtree.source_path AND cardinality(path) > v_src_len LOOP
    v_rel_path := (v_row.path)[v_src_len + 1:];
    v_new_path := platform_copy_subtree.target_path || v_rel_path;
    v_root_hash := "constructive_platform_function_graph_public".insert_node_at_path(platform_copy_subtree.target_scope_id, v_root_hash, v_new_path, v_row.data, '{}'::uuid[], '{}'::text[]);
  END LOOP;
  RETURN v_root_hash;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_private.platform_deserialize_graph(
  IN database_id uuid,
  IN name text,
  IN snapshot jsonb
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_store_id uuid;
  v_root_hash uuid;
  v_graph_id uuid;
  v_row record;
  v_key text;
  v_entry jsonb;
BEGIN
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_store (
    database_id,
    name
  )
  VALUES
    (platform_deserialize_graph.database_id, platform_deserialize_graph.name)
  RETURNING id INTO v_store_id;
  PERFORM "constructive_platform_function_graph_public".init_empty_repo(platform_deserialize_graph.database_id, v_store_id);
  FOR v_row IN SELECT *
  FROM jsonb_each(platform_deserialize_graph.tree_data->'tree') LOOP
    v_entry := v_row.value;
    v_root_hash := "constructive_platform_function_graph_public".insert_node_at_path(platform_deserialize_graph.database_id, v_root_hash, (v_entry->'path')::text[], v_entry->'data', '{}'::uuid[], '{}'::text[]);
  END LOOP;
  INSERT INTO "constructive_compute_public".platform_function_graphs (
    database_id,
    store_id,
    name,
    description,
    context
  )
  VALUES
    (platform_deserialize_graph.database_id, v_store_id, platform_deserialize_graph.name, platform_deserialize_graph.tree_data->>'description', platform_deserialize_graph.tree_data->>'context')
  RETURNING id INTO v_graph_id;
  UPDATE "constructive_platform_function_graph_public".platform_function_graph_ref AS r SET
  commit_id = (SELECT id
  FROM "constructive_platform_function_graph_public".platform_function_graph_commit
  WHERE
    database_id = platform_deserialize_graph.database_id AND store_id = v_store_id
  ORDER BY
    created_at DESC
  LIMIT
  1)
  WHERE
    r.database_id = platform_deserialize_graph.database_id AND (r.store_id = v_store_id AND r.name = 'main');
  RETURN v_graph_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_private.platform_insert_subnet_nodes(
  IN database_id uuid,
  IN root_hash uuid,
  IN base_path text[],
  IN nodes_json jsonb,
  IN edges_json jsonb DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_node jsonb;
  v_edge jsonb;
  v_node_name text;
  v_node_data jsonb;
  v_edge_idx int := 0;
  v_root uuid;
BEGIN
  v_root := platform_insert_subnet_nodes.root_hash;
  IF platform_insert_subnet_nodes.nodes_json IS NOT NULL THEN
    FOR v_node IN SELECT *
    FROM jsonb_array_elements(platform_insert_subnet_nodes.nodes_json) LOOP
      v_node_name := v_node->>'name';
      v_node_data := jsonb_build_object('type', v_node->>'type');
      IF v_node ? 'meta' THEN
        v_node_data := v_node_data || jsonb_build_object('meta', v_node->'meta');
      END IF;
      IF v_node ? 'props' THEN
        v_node_data := v_node_data || jsonb_build_object('props', v_node->'props');
      END IF;
      v_root := "constructive_platform_function_graph_public".insert_node_at_path(platform_insert_subnet_nodes.database_id, v_root, platform_insert_subnet_nodes.base_path || ARRAY['nodes', v_node_name], v_node_data, '{}'::uuid[], '{}'::text[]);
      IF v_node ? 'nodes' THEN
        v_root := "constructive_compute_private".platform_insert_subnet_nodes(platform_insert_subnet_nodes.database_id, v_root, platform_insert_subnet_nodes.base_path || ARRAY['nodes', v_node_name], v_node->'nodes', v_node->'edges');
      END IF;
    END LOOP;
  END IF;
  IF platform_insert_subnet_nodes.edges_json IS NOT NULL THEN
    FOR v_edge IN SELECT *
    FROM jsonb_array_elements(platform_insert_subnet_nodes.edges_json) LOOP
      v_root := "constructive_platform_function_graph_public".insert_node_at_path(platform_insert_subnet_nodes.database_id, v_root, platform_insert_subnet_nodes.base_path || ARRAY['edges', v_edge_idx::text], jsonb_build_object('src', v_edge->'src', 'dst', v_edge->'dst'), '{}'::uuid[], '{}'::text[]);
      v_edge_idx := v_edge_idx + 1;
    END LOOP;
  END IF;
  RETURN v_root;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_private.platform_serialize_graph(
  IN graph_id uuid
) RETURNS jsonb AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_tree_id uuid;
  v_row record;
  v_result jsonb;
  v_nodes jsonb := '{}'::jsonb;
  v_edges jsonb := '{}'::jsonb;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_serialize_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'no tree found for graph';
  END IF;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id) LOOP
    v_nodes := v_nodes || jsonb_build_object(array_to_string(v_row.path, '/'), jsonb_build_object('path', v_row.path, 'data', v_row.data));
  END LOOP;
  v_result := jsonb_build_object('name', v_graph.name, 'context', v_graph.context, 'description', v_graph.description, 'tree', v_nodes);
  RETURN v_result;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_private.platform_tick_execution(
  IN execution_id uuid
) RETURNS int AS $EOFCODE$
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
  FOR v_node IN SELECT jsonb_build_object('name', (path)[5], 'type', data->>'type', 'props', data->'props')
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
      SELECT "constructive_platform_function_graph_public".platform_import_graph_json(v_graph.database_id, ('def_' || platform_tick_execution.execution_id) || ('_' || v_node_name), v_def_data->'graph') INTO v_sub_graph_id;
      PERFORM "constructive_platform_function_graph_public".platform_start_execution(graph_id:=v_sub_graph_id, input_payload:=v_inputs, parent_execution_id:=platform_tick_execution.execution_id, parent_node_name:=v_node_name);
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
    INSERT INTO app_jobs.jobs (
      database_id,
      task_identifier,
      payload
    )
    VALUES
      (v_exec.database_id, v_node_type, (json_build_object('execution_id', v_exec.id, 'node_name', v_node_name, 'node_type', v_node_type, 'inputs', v_inputs))::json);
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT ALL ON FUNCTIONS TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT ALL ON FUNCTIONS TO anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT USAGE ON SEQUENCES TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_private
  GRANT ALL ON TABLES TO administrator;

CREATE TABLE constructive_compute_private.platform_function_graph_execution_outputs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_private.platform_function_graph_execution_outputs IS 'Content-addressed store for execution outputs — hash-referenced from node_outputs';

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_execution_outputs.created_at IS 'Timestamp of output creation';

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ADD COLUMN data jsonb;

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ALTER COLUMN data SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_execution_outputs.data IS 'The actual output payload from a completed node';

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_execution_outputs.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ADD COLUMN hash bytea;

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ALTER COLUMN hash SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_execution_outputs.hash IS 'SHA-256 hash of the data JSONB — content-addressed deduplication';

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_execution_outputs.id IS 'Unique execution output identifier';

ALTER TABLE constructive_compute_private.platform_function_graph_execution_outputs 
  ADD CONSTRAINT platform_function_graph_execution_outputs_pkey PRIMARY KEY (created_at, id);

CREATE UNIQUE INDEX idx_platform_function_graph_execution_outputs_unique_hash ON constructive_compute_private.platform_function_graph_execution_outputs (database_id, hash, created_at);



CREATE TABLE constructive_compute_private.platform_function_graph_executions (
  started_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (started_at);

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_private.platform_function_graph_executions IS 'Ephemeral execution state for flow graph evaluation';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN completed_at timestamptz;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.completed_at IS 'Execution completion timestamp';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN current_wave int;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN current_wave SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN current_wave SET DEFAULT 0;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.current_wave IS 'Index into execution_plan — tick only processes this wave';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN definitions_commit_id uuid;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.definitions_commit_id IS 'Pinned definitions store commit for deterministic evaluation';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN entity_id uuid;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.entity_id IS 'Entity context (org/team) for scoped billing';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN error_code text;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.error_code IS 'Machine-readable error code when status = failed';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN error_message text;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.error_message IS 'Human-readable error description when status = failed';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN execution_plan jsonb;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.execution_plan IS 'Pre-computed topological sort as array of wave objects';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN graph_id uuid;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN graph_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.graph_id IS 'FK to the graph definition being executed';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.id IS 'Unique execution identifier';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN input_payload jsonb;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.input_payload IS 'Initial inputs provided at invocation time';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN invocation_id uuid;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.invocation_id IS 'Parent function_invocations row (for metering)';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN max_pending_jobs int;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs SET DEFAULT 50;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.max_pending_jobs IS 'Maximum pending jobs before execution is failed (default 50)';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN max_ticks int;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN max_ticks SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN max_ticks SET DEFAULT 100;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.max_ticks IS 'Maximum ticks before execution is failed (default 100)';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN node_outputs jsonb;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN node_outputs SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN node_outputs SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.node_outputs IS 'Map of node_name → execution output id (content-addressed hash reference)';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN output_node text;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN output_node SET NOT NULL;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.output_node IS 'Target output boundary node name to resolve';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN output_payload jsonb;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.output_payload IS 'Final result extracted from terminal output node';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN output_port text;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN output_port SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN output_port SET DEFAULT 'value';

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.output_port IS 'Target output port name (default: value)';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN parent_execution_id uuid;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.parent_execution_id IS 'Parent execution when this is a sub-execution';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN parent_node_name text;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.parent_node_name IS 'Node name in parent execution that spawned this sub-execution';

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.started_at IS 'Execution start timestamp';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN status text;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.status IS 'Lifecycle: pending → running → completed/failed/cancelled';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_status_chk 
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN tick_count int;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN tick_count SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN tick_count SET DEFAULT 0;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.tick_count IS 'Number of evaluate_step ticks executed';

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD COLUMN timeout_at timestamptz;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN timeout_at SET NOT NULL;

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ALTER COLUMN timeout_at SET DEFAULT now() + '5 minutes'::interval;

COMMENT ON COLUMN constructive_compute_private.platform_function_graph_executions.timeout_at IS 'Absolute deadline — execution fails if still running after this time';

CREATE SCHEMA constructive_compute_public;

CREATE TABLE constructive_compute_public.platform_function_graphs ();

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_pkey PRIMARY KEY (started_at, id);



CREATE FUNCTION constructive_compute_public.platform_add_edge(
  IN database_id uuid,
  IN root_hash uuid,
  IN src_node text,
  IN src_port text,
  IN dst_node text,
  IN dst_port text,
  IN context text,
  IN graph_name text
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_edge_count integer := 0;
  v_scope_path text[];
  v_row record;
  v_edge_data jsonb;
  v_src_segments text[];
  v_dst_segments text[];
BEGIN
  FOR v_row IN SELECT *
  FROM "constructive_platform_function_graph_public".get_all(platform_add_edge.database_id, platform_add_edge.root_hash)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'edges') AND ((path)[1] = platform_add_edge.context AND ((path)[2] = 'graphs' AND (path)[3] = platform_add_edge.graph_name)) LOOP
    v_edge_count := v_edge_count + 1;
  END LOOP;
  v_scope_path := ARRAY[platform_add_edge.context, 'graphs', platform_add_edge.graph_name, 'edges', v_edge_count::text];
  v_edge_data := jsonb_build_object('src', jsonb_build_object('node', platform_add_edge.src_node, 'port', platform_add_edge.src_port), 'dst', jsonb_build_object('node', platform_add_edge.dst_node, 'port', platform_add_edge.dst_port));
  RETURN "constructive_platform_function_graph_public".insert_node_at_path(platform_add_edge.database_id, platform_add_edge.root_hash, v_scope_path, v_edge_data, '{}'::uuid[], '{}'::text[]);
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_add_edge_and_save(
  IN graph_id uuid,
  IN src_node text,
  IN src_port text,
  IN dst_node text,
  IN dst_port text,
  IN message text DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_root_hash uuid;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_add_edge_and_save.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  v_root_hash := "constructive_platform_function_graph_public".platform_add_edge(v_graph.database_id, v_root_hash, platform_add_edge_and_save.src_node, platform_add_edge_and_save.src_port, platform_add_edge_and_save.dst_node, platform_add_edge_and_save.dst_port, v_graph.context, v_graph.name);
  PERFORM "constructive_platform_function_graph_public".platform_save_graph(platform_add_edge_and_save.graph_id, v_root_hash, coalesce(platform_add_edge_and_save.message, 'add edge' || platform_add_edge_and_save.src_node));
  RETURN platform_add_edge_and_save.graph_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_add_node(
  IN database_id uuid,
  IN root_hash uuid,
  IN node_name text,
  IN node_type text,
  IN context text,
  IN graph_name text,
  IN props jsonb DEFAULT NULL,
  IN meta jsonb DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_path text[];
  v_segments text[];
  v_node_data jsonb;
  v_i integer;
BEGIN
  v_segments := string_to_array(platform_add_node.node_name, '/');
  v_path := ARRAY[platform_add_node.context, 'graphs', platform_add_node.graph_name];
  FOR v_i IN 1..array_length(v_segments, 1) LOOP
    v_path := v_path || ARRAY['nodes', (v_segments)[v_i]];
  END LOOP;
  v_node_data := jsonb_build_object('type', platform_add_node.node_type);
  IF platform_add_node.meta IS NOT NULL THEN
    v_node_data := v_node_data || jsonb_build_object('meta', platform_add_node.meta);
  END IF;
  IF platform_add_node.props IS NOT NULL THEN
    v_node_data := v_node_data || jsonb_build_object('props', platform_add_node.props);
  END IF;
  RETURN "constructive_platform_function_graph_public".insert_node_at_path(platform_add_node.database_id, platform_add_node.root_hash, v_path, v_node_data, '{}'::uuid[], '{}'::text[]);
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_add_node_and_save(
  IN graph_id uuid,
  IN node_name text,
  IN node_type text,
  IN props jsonb DEFAULT NULL,
  IN meta jsonb DEFAULT NULL,
  IN message text DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_root_hash uuid;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_add_node_and_save.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  v_root_hash := "constructive_platform_function_graph_public".platform_add_node(v_graph.database_id, v_root_hash, platform_add_node_and_save.node_name, platform_add_node_and_save.node_type, v_graph.context, v_graph.name, platform_add_node_and_save.props, platform_add_node_and_save.meta);
  PERFORM "constructive_platform_function_graph_public".platform_save_graph(platform_add_node_and_save.graph_id, v_root_hash, coalesce(platform_add_node_and_save.message, 'add node: ' || platform_add_node_and_save.node_name));
  RETURN platform_add_node_and_save.graph_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_copy_graph(
  IN database_id uuid,
  IN graph_id uuid,
  IN name text
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_snapshot jsonb;
BEGIN
  v_snapshot := "constructive_compute_private".platform_serialize_graph(platform_copy_graph.graph_id);
  RETURN "constructive_compute_private".platform_deserialize_graph(platform_copy_graph.database_id, platform_copy_graph.name, v_snapshot);
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_public.platform_create_function_graph(
  IN database_id uuid,
  IN name text,
  IN context text DEFAULT 'function',
  IN description text DEFAULT NULL,
  IN entity_id uuid DEFAULT NULL,
  IN created_by uuid DEFAULT NULL,
  IN definitions_commit_id uuid DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_store_id uuid;
  v_graph_id uuid;
BEGIN
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_store (
    database_id,
    name
  )
  VALUES
    (platform_create_function_graph.database_id, platform_create_function_graph.name)
  RETURNING id INTO v_store_id;
  PERFORM "constructive_platform_function_graph_public".init_empty_repo(platform_create_function_graph.database_id, v_store_id);
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graphs (
    database_id,
    store_id,
    name,
    description,
    context,
    entity_id,
    created_by,
    definitions_commit_id
  )
  VALUES
    (platform_create_function_graph.database_id, v_store_id, platform_create_function_graph.name, platform_create_function_graph.description, platform_create_function_graph.context, platform_create_function_graph.entity_id, platform_create_function_graph.created_by, platform_create_function_graph.definitions_commit_id)
  RETURNING id INTO v_graph_id;
  RETURN v_graph_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_import_definitions(
  IN graph_id uuid,
  IN source_scope_id uuid,
  IN source_commit_id uuid,
  IN contexts text[]
) RETURNS void AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_root_hash uuid;
  v_ctx text;
  v_i int;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_import_definitions.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  FOR v_i IN 1..cardinality(platform_import_definitions.contexts) LOOP
    v_ctx := (platform_import_definitions.contexts)[v_i];
    v_root_hash := "constructive_compute_private".platform_copy_subtree(platform_import_definitions.source_scope_id, platform_import_definitions.source_commit_id, ARRAY[v_ctx, 'definitions'], v_graph.database_id, v_root_hash, ARRAY[v_ctx, 'definitions']);
  END LOOP;
  PERFORM "constructive_platform_function_graph_public".platform_save_graph(platform_import_definitions.graph_id, v_root_hash, 'import definitions');
  RETURN;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_public.platform_import_graph_json(
  IN database_id uuid,
  IN name text,
  IN graph_json jsonb,
  IN context text DEFAULT NULL,
  IN description text DEFAULT NULL,
  IN entity_id uuid DEFAULT NULL,
  IN created_by uuid DEFAULT NULL,
  IN definitions_commit_id uuid DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_graph_id uuid;
  v_graph "constructive_compute_public".platform_function_graphs;
  v_root_hash uuid;
  v_context text;
  v_node jsonb;
  v_edge jsonb;
  v_node_name text;
  v_edge_idx int := 0;
  v_def jsonb;
BEGIN
  v_context := coalesce(platform_import_graph_json.context, platform_import_graph_json.graph_json->>'context', 'function');
  v_graph_id := "constructive_compute_public".platform_create_function_graph(platform_import_graph_json.database_id, platform_import_graph_json.name, v_context, platform_import_graph_json.description, platform_import_graph_json.entity_id, platform_import_graph_json.created_by, platform_import_graph_json.definitions_commit_id);
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = v_graph_id INTO v_graph;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  IF platform_import_graph_json.graph_json ? 'nodes' THEN
    FOR v_node IN SELECT *
    FROM jsonb_array_elements(platform_import_graph_json.graph_json->'nodes') LOOP
      v_node_name := v_node->>'name';
      v_root_hash := "constructive_platform_function_graph_public".platform_add_node(v_graph.database_id, v_root_hash, v_node_name, v_node->>'type', v_graph.context, v_graph.name, v_node->'props', v_node->'meta');
      IF v_node ? 'nodes' THEN
        v_root_hash := "constructive_compute_private".platform_insert_subnet_nodes(v_graph.database_id, v_root_hash, ARRAY[v_graph.context, 'graphs', v_graph.name, 'nodes', v_node_name], v_node->'nodes', v_node->'edges');
        v_root_hash := "constructive_platform_function_graph_public".insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_context, 'definitions', v_node_name], jsonb_build_object('name', v_node_name, 'context', v_graph.context, 'graph', jsonb_build_object('name', v_node_name || '_subnet', 'context', v_graph.context, 'nodes', v_node->'nodes', 'edges', v_node->'edges')), '{}'::uuid[], '{}'::text[]);
      END IF;
    END LOOP;
  END IF;
  IF platform_import_graph_json.graph_json ? 'edges' THEN
    FOR v_edge IN SELECT *
    FROM jsonb_array_elements(platform_import_graph_json.graph_json->'edges') LOOP
      v_root_hash := "constructive_platform_function_graph_public".insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_graph.context, 'graphs', v_graph.name, 'edges', v_edge_idx::text], jsonb_build_object('src', v_edge->'src', 'dst', v_edge->'dst'), '{}'::uuid[], '{}'::text[]);
      v_edge_idx := v_edge_idx + 1;
    END LOOP;
  END IF;
  IF platform_import_graph_json.graph_json ? 'definitions' THEN
    FOR v_def IN SELECT *
    FROM jsonb_array_elements(platform_import_graph_json.graph_json->'definitions') LOOP
      v_root_hash := "constructive_platform_function_graph_public".insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_context, 'definitions', v_def->>'name'], v_def, '{}'::uuid[], '{}'::text[]);
    END LOOP;
  END IF;
  PERFORM "constructive_platform_function_graph_public".platform_save_graph(v_graph_id, v_root_hash, 'import from JSON');
  RETURN v_graph_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_public.platform_read_function_graph(
  IN graph_id uuid
) RETURNS jsonb AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_tree_id uuid;
  v_result jsonb;
  v_nodes jsonb := '[]'::jsonb;
  v_edges jsonb := '[]'::jsonb;
  v_row record;
  v_node_data jsonb;
  v_node_obj jsonb;
  v_edge_data jsonb;
  v_definitions jsonb := '[]'::jsonb;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_read_function_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'no tree found for graph';
  END IF;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'nodes') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name)) LOOP
    v_node_data := v_row.data;
    v_node_obj := jsonb_build_object('name', (v_row.path)[5], 'type', v_node_data->>'type');
    IF v_node_data ? 'meta' THEN
      v_node_obj := v_node_obj || jsonb_build_object('meta', v_node_data->'meta');
    END IF;
    IF v_node_data ? 'props' THEN
      v_node_obj := v_node_obj || jsonb_build_object('props', v_node_data->'props');
    END IF;
    v_nodes := v_nodes || jsonb_build_array(v_node_obj);
  END LOOP;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'edges') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name))
  ORDER BY
    (path)[5]::integer LOOP
    v_edges := v_edges || jsonb_build_array(v_row.data);
  END LOOP;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 3 AND (path)[2] = 'definitions') AND (path)[1] = v_graph.context LOOP
    v_definitions := v_definitions || jsonb_build_array(v_row.data);
  END LOOP;
  v_result := jsonb_build_object('name', v_graph.name, 'context', v_graph.context, 'nodes', v_nodes, 'edges', v_edges, 'definitions', v_definitions);
  RETURN v_result;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_save_graph(
  IN graph_id uuid,
  IN root_hash uuid,
  IN message text DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_commit_id uuid;
  v_msg text;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_save_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  v_msg := coalesce(platform_save_graph.message, (now())::text);
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_commit (
    database_id,
    store_id,
    message,
    parent_ids,
    tree_id
  )
  SELECT
    r.database_id,
    r.store_id,
    v_msg,
    ARRAY[r.commit_id]::uuid[],
    platform_save_graph.root_hash
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main'
  RETURNING id INTO v_commit_id;
  UPDATE "constructive_platform_function_graph_public".platform_function_graph_ref AS r SET
  commit_id = v_commit_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main';
  UPDATE "constructive_platform_function_graph_public".platform_function_graphs SET
  is_valid = false, validation_errors = NULL, updated_at = now()
  WHERE
    id = platform_save_graph.graph_id;
  RETURN v_commit_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE FUNCTION constructive_compute_public.platform_start_execution(
  IN graph_id uuid,
  IN input_payload jsonb DEFAULT '{}'::jsonb,
  IN output_node text DEFAULT 'output_result',
  IN output_port text DEFAULT 'value',
  IN max_ticks int DEFAULT 100,
  IN max_pending_jobs int DEFAULT 50,
  IN timeout_interval interval DEFAULT '5 minutes'::interval,
  IN parent_execution_id uuid DEFAULT NULL,
  IN parent_node_name text DEFAULT NULL
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
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
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_start_execution.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'no tree found for graph';
  END IF;
  FOR v_node_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
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
    IF v_port_name IS NOT NULL AND platform_start_execution.input_payload ? v_port_name THEN
      v_input_value := platform_start_execution.input_payload->v_port_name;
      v_output_data := jsonb_build_object('value', v_input_value);
      v_output_hash := digest(v_output_data::text, 'sha256');
      INSERT INTO "constructive_compute_private".platform_function_graph_execution_outputs (
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
        FROM "constructive_compute_private".platform_function_graph_execution_outputs
        WHERE
          database_id = v_graph.database_id AND hash = v_output_hash INTO v_obj_id;
      END IF;
      v_node_outputs := v_node_outputs || jsonb_build_object((v_node_row.path)[5], v_obj_id);
    END IF;
  END LOOP;
  FOR v_node_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
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
    IF v_prop_name IS NOT NULL AND platform_start_execution.input_payload ? v_prop_name THEN
      v_prop_value := platform_start_execution.input_payload->v_prop_name;
    END IF;
    IF v_prop_value IS NOT NULL THEN
      v_output_data := jsonb_build_object('value', v_prop_value);
      v_output_hash := digest(v_output_data::text, 'sha256');
      INSERT INTO "constructive_compute_private".platform_function_graph_execution_outputs (
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
        FROM "constructive_compute_private".platform_function_graph_execution_outputs
        WHERE
          database_id = v_graph.database_id AND hash = v_output_hash INTO v_obj_id;
      END IF;
      v_node_outputs := v_node_outputs || jsonb_build_object((v_node_row.path)[5], v_obj_id);
    END IF;
  END LOOP;
  INSERT INTO "constructive_compute_private".platform_function_graph_executions (
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
    (platform_start_execution.graph_id, v_graph.database_id, platform_start_execution.output_node, platform_start_execution.output_port, platform_start_execution.input_payload, 'running', v_node_outputs, platform_start_execution.max_ticks, platform_start_execution.max_pending_jobs, now() + platform_start_execution.timeout_interval, platform_start_execution.parent_execution_id, platform_start_execution.parent_node_name)
  RETURNING id INTO v_exec_id;
  PERFORM "constructive_compute_private".platform_tick_execution(v_exec_id);
  RETURN v_exec_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_compute_public.platform_validate_function_graph(
  IN graph_id uuid
) RETURNS boolean AS $EOFCODE$
DECLARE
  v_graph "constructive_compute_public".platform_function_graphs;
  v_tree_id uuid;
  v_errors jsonb := '[]'::jsonb;
  v_row record;
  v_node_names text[] := '{}'::text[];
  v_node_types jsonb := '{}'::jsonb;
  v_edges jsonb := '[]'::jsonb;
  v_edge jsonb;
  v_adj jsonb := '{}'::jsonb;
  v_src_node text;
  v_dst_node text;
  v_visited text[] := '{}'::text[];
  v_current text;
  v_i int;
  v_has_cycle boolean := false;
  v_cycle_path text;
  v_has_output boolean := false;
  v_is_valid boolean;
BEGIN
  SELECT *
  FROM "constructive_compute_public".platform_function_graphs
  WHERE
    id = platform_validate_function_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_platform_function_graph_public".platform_function_graph_ref AS r INNER JOIN "constructive_platform_function_graph_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'NO_TREE', 'message', 'No object tree found for graph'));
    UPDATE "constructive_compute_public".platform_function_graphs SET
    is_valid = false, validation_errors = v_errors, updated_at = now()
    WHERE
      id = platform_validate_function_graph.graph_id;
    RETURN false;
  END IF;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'nodes') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name)) LOOP
    v_node_names := v_node_names || (v_row.path)[5];
    v_node_types := v_node_types || jsonb_build_object((v_row.path)[5], v_row.data->>'type');
    IF (v_row.data->>'type') = 'graphOutput' THEN
      v_has_output := true;
    END IF;
  END LOOP;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_platform_function_graph_public".get_all(v_graph.database_id, v_tree_id)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'edges') AND ((path)[1] = v_graph.context AND ((path)[2] = 'graphs' AND (path)[3] = v_graph.name)) LOOP
    v_edges := v_edges || jsonb_build_array(v_row.data);
  END LOOP;
  FOR v_edge IN SELECT *
  FROM jsonb_array_elements(v_edges) LOOP
    v_src_node := (v_edge->'src')->>'node';
    v_dst_node := (v_edge->'dst')->>'node';
    IF v_src_node IS NOT NULL AND NOT (v_src_node = ANY( v_node_names )) THEN
      v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'DANGLING_EDGE', 'message', 'Edge references non-existent source node: ' || v_src_node, 'node', v_src_node));
    END IF;
    IF v_dst_node IS NOT NULL AND NOT (v_dst_node = ANY( v_node_names )) THEN
      v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'DANGLING_EDGE', 'message', 'Edge references non-existent destination node: ' || v_dst_node, 'node', v_dst_node));
    END IF;
  END LOOP;
  FOR v_edge IN SELECT *
  FROM jsonb_array_elements(v_edges) LOOP
    v_src_node := (v_edge->'src')->>'node';
    v_dst_node := (v_edge->'dst')->>'node';
    IF v_src_node IS NOT NULL AND v_dst_node IS NOT NULL THEN
      IF v_adj ? v_src_node THEN
        v_adj := jsonb_set(v_adj, ARRAY[v_src_node], (v_adj->v_src_node) || jsonb_build_array(v_dst_node));
      ELSE
        v_adj := v_adj || jsonb_build_object(v_src_node, jsonb_build_array(v_dst_node));
      END IF;
    END IF;
  END LOOP;
  FOR v_i IN 1..coalesce(array_length(v_node_names, 1), 0) LOOP
    v_current := (v_node_names)[v_i];
    v_visited := '{}'::text[];
    LOOP
      EXIT WHEN v_current IS NULL;
      EXIT WHEN coalesce(array_length(v_visited, 1), 0) >= coalesce(array_length(v_node_names, 1), 0);
      IF v_current = ANY( v_visited ) THEN
        v_has_cycle := true;
        v_cycle_path := v_current;
        EXIT;
      END IF;
      v_visited := v_visited || v_current;
      IF v_adj ? v_current THEN
        v_current := (v_adj->v_current)->>0;
      ELSE
        v_current := NULL;
      END IF;
    END LOOP;
    IF v_has_cycle THEN
      EXIT;
    END IF;
  END LOOP;
  IF v_has_cycle THEN
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'CYCLE_DETECTED', 'message', 'Graph contains a cycle'));
  END IF;
  IF NOT (v_has_output) THEN
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'NO_OUTPUT', 'message', 'Graph has no graphOutput boundary node'));
  END IF;
  v_is_valid := jsonb_array_length(v_errors) = 0;
  UPDATE "constructive_compute_public".platform_function_graphs SET
  is_valid = v_is_valid, validation_errors = CASE 
    WHEN v_is_valid THEN NULL 
    ELSE v_errors 
  END, updated_at = now()
  WHERE
    id = platform_validate_function_graph.graph_id;
  RETURN v_is_valid;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT ALL ON FUNCTIONS TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT ALL ON FUNCTIONS TO anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT USAGE ON SEQUENCES TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_compute_public
  GRANT ALL ON TABLES TO administrator;

CREATE TABLE constructive_compute_public.org_function_execution_logs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.org_function_execution_logs IS 'Function execution logs — structured console output per invocation';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.actor_id IS 'User who triggered the execution (NULL for system/cron)';

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.created_at IS 'Log entry timestamp (partition key)';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.id IS 'Unique log entry identifier';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN invocation_id uuid;

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.invocation_id IS 'Invocation this log entry belongs to (NULL for standalone job logs)';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN log_level text;

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ALTER COLUMN log_level SET NOT NULL;

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ALTER COLUMN log_level SET DEFAULT 'info';

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.log_level IS 'Log severity: debug, info, warn, error';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD CONSTRAINT org_function_execution_logs_log_level_chk 
    CHECK (log_level IN ('debug', 'info', 'warn', 'error'));

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN message text;

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ALTER COLUMN message SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.message IS 'Log message text';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN metadata jsonb;

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.metadata IS 'Structured context (labels, trace data, extra fields)';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD COLUMN task_identifier text;

COMMENT ON COLUMN constructive_compute_public.org_function_execution_logs.task_identifier IS 'Function routing key (NULL for generic job logs)';

ALTER TABLE constructive_compute_public.org_function_execution_logs 
  ADD CONSTRAINT org_function_execution_logs_pkey PRIMARY KEY (created_at, id);

CREATE INDEX org_function_execution_logs_invocation_id_created_at_idx ON constructive_compute_public.org_function_execution_logs (invocation_id, created_at);



CREATE TABLE constructive_compute_public.org_function_invocations (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_compute_public.org_function_invocations 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.org_function_invocations IS 'Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.actor_id IS 'Who triggered the invocation (NULL for system/cron)';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN completed_at timestamptz;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.completed_at IS 'When execution completed';

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.created_at IS 'Invocation creation timestamp (partition key)';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN duration_ms int;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.duration_ms IS 'Wall-clock execution time in milliseconds';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN error text;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.error IS 'Error message when status is failed';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN graph_execution_id uuid;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.graph_execution_id IS 'Groups all node invocations from a single flow graph execution';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.org_function_invocations 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.org_function_invocations 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.id IS 'Unique invocation identifier';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN job_id bigint;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.job_id IS 'FK to app_jobs.jobs — the underlying transport';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN parent_invocation_id uuid;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.parent_invocation_id IS 'Parent invocation when this is a child node of a flow graph execution';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN payload jsonb;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.payload IS 'Function input payload';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN result jsonb;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.result IS 'Function return value (success) or structured error (failure)';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN started_at timestamptz;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.started_at IS 'When execution started';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN status text;

ALTER TABLE constructive_compute_public.org_function_invocations 
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE constructive_compute_public.org_function_invocations 
  ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.status IS 'Lifecycle: pending → running → completed/failed/cancelled';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD CONSTRAINT org_function_invocations_status_chk 
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD COLUMN task_identifier text;

ALTER TABLE constructive_compute_public.org_function_invocations 
  ALTER COLUMN task_identifier SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.org_function_invocations.task_identifier IS 'Function routing slug (scope:name). Links to function_definitions.task_identifier by convention — no FK.';

ALTER TABLE constructive_compute_public.org_function_invocations 
  ADD CONSTRAINT org_function_invocations_pkey PRIMARY KEY (created_at, id);

CREATE INDEX org_function_invocations_actor_id_created_at_idx ON constructive_compute_public.org_function_invocations (actor_id, created_at);

CREATE INDEX org_function_invocations_graph_execution_id_created_at_idx ON constructive_compute_public.org_function_invocations (graph_execution_id, created_at);

CREATE INDEX org_function_invocations_task_identifier_created_at_idx ON constructive_compute_public.org_function_invocations (task_identifier, created_at);



CREATE TABLE constructive_compute_public.platform_function_definitions ();

ALTER TABLE constructive_compute_public.platform_function_definitions 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.platform_function_definitions IS 'Function definitions — registered cloud functions with routing, queue, and retry configuration';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN category text;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.category IS 'UI palette category for grouping (e.g. email, data, ai)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.description IS 'Human-readable description of what this function does';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN icon text;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.icon IS 'Icon identifier for UI palette display (e.g. zap, mail, code)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN inputs jsonb;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN inputs SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN inputs SET DEFAULT '[]'::jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.inputs IS 'Input port definitions: [{name, type, description?, optional?, multi?, schema?}]';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN is_built_in boolean;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN is_built_in SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.is_built_in IS 'Whether this function is a built-in platform function (synced from platform) vs user-created';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN is_invocable boolean;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN is_invocable SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN is_invocable SET DEFAULT false;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.is_invocable IS 'Whether this function can be called via function_invocations (public API). Default false = internal-only via add_job()';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN max_attempts int;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN max_attempts SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN max_attempts SET DEFAULT 25;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.max_attempts IS 'Maximum retry attempts for the underlying job';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN name text;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.name IS 'Function name within scope (e.g. send_verification_link, process_file_embedding)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN namespace_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.namespace_id IS 'Namespace this function belongs to (FK to namespaces table)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN outputs jsonb;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN outputs SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN outputs SET DEFAULT '[]'::jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.outputs IS 'Output port definitions: [{name, type, description?, optional?, multi?, schema?}]';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN priority int;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN priority SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN priority SET DEFAULT 0;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.priority IS 'Job priority (lower = higher priority)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN props jsonb;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN props SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN props SET DEFAULT '[]'::jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.props IS 'Property definitions: [{name, type, default?, description?, required?, schema?}]';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN queue_name text;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN queue_name SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN queue_name SET DEFAULT 'default';

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.queue_name IS 'Job queue name for serialization (e.g. email, ai, default)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN scope text;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN scope SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.scope IS 'Function grouping scope (e.g. email, embed, chunk, custom)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN service_url text;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.service_url IS 'Optional service URL override for function dispatch. NULL = use gateway convention (gatewayUrl/task_identifier). Set for customer-deployed functions or external endpoints.';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN task_identifier text;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN task_identifier SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.task_identifier IS 'Computed routing slug: scope:name (used by Knative job worker for dispatch)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN volatile boolean;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN volatile SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN volatile SET DEFAULT false;

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.volatile IS 'Whether this function has side effects (cannot be cached or memoized)';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_namespace_id_fkey
    FOREIGN KEY(namespace_id)
    REFERENCES constructive_infra_public.platform_namespaces (id)
    ON DELETE SET NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_pkey PRIMARY KEY (id);

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_scope_name_key 
    UNIQUE (scope, name);

CREATE INDEX platform_function_definitions_created_at_idx ON constructive_compute_public.platform_function_definitions (created_at);

CREATE INDEX platform_function_definitions_updated_at_idx ON constructive_compute_public.platform_function_definitions (updated_at);

CREATE TRIGGER platform_function_definitions_job_functionprovision_insert_tg
  AFTER INSERT
  ON constructive_compute_public.platform_function_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE constructive_private.platform_function_definitions_job_functionprovision_insert();

CREATE TRIGGER timestamps_tg
  BEFORE INSERT OR UPDATE
  ON constructive_compute_public.platform_function_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE stamps.timestamps();

CREATE TABLE constructive_compute_public.platform_function_execution_logs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.platform_function_execution_logs IS 'Function execution logs — structured console output per invocation';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.actor_id IS 'User who triggered the execution (NULL for system/cron)';

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.created_at IS 'Log entry timestamp (partition key)';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.id IS 'Unique log entry identifier';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN invocation_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.invocation_id IS 'Invocation this log entry belongs to (NULL for standalone job logs)';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN log_level text;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN log_level SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN log_level SET DEFAULT 'info';

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.log_level IS 'Log severity: debug, info, warn, error';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_log_level_chk 
    CHECK (log_level IN ('debug', 'info', 'warn', 'error'));

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN message text;

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ALTER COLUMN message SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.message IS 'Log message text';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN metadata jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.metadata IS 'Structured context (labels, trace data, extra fields)';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD COLUMN task_identifier text;

COMMENT ON COLUMN constructive_compute_public.platform_function_execution_logs.task_identifier IS 'Function routing key (NULL for generic job logs)';

ALTER TABLE constructive_compute_public.platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_pkey PRIMARY KEY (created_at, id);

CREATE INDEX platform_function_execution_logs_invocation_id_created_at_idx ON constructive_compute_public.platform_function_execution_logs (invocation_id, created_at);



ALTER TABLE constructive_compute_public.platform_function_graphs 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.platform_function_graphs IS 'Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN context text;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN context SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN context SET DEFAULT 'function';

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.context IS 'Evaluator/runtime context (function, js, sql, system)';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.created_at IS 'Timestamp of graph creation';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN created_by uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.created_by IS 'Actor who created this graph';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN definitions_commit_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.definitions_commit_id IS 'Pinned definitions store commit for deterministic evaluation';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.description IS 'Human-readable description of the graph';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN entity_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.entity_id IS 'Entity context (org/team) for scoped billing';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.id IS 'Unique graph identifier';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN is_valid boolean;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN is_valid SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN is_valid SET DEFAULT false;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.is_valid IS 'Whether graph passes structural validation';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN name text;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.name IS 'Graph name (unique per database)';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN store_id uuid;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN store_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.store_id IS 'Graph store (Merkle store) holding the graph definition';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.updated_at IS 'Timestamp of last modification';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD COLUMN validation_errors jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_graphs.validation_errors IS 'Array of validation error objects when is_valid = false';

ALTER TABLE constructive_compute_public.platform_function_graphs 
  ADD CONSTRAINT platform_function_graphs_pkey PRIMARY KEY (id);

ALTER TABLE constructive_compute_private.platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_graph_id_fkey
    FOREIGN KEY(graph_id)
    REFERENCES constructive_compute_public.platform_function_graphs (id);

CREATE UNIQUE INDEX idx_platform_function_graphs_unique_name ON constructive_compute_public.platform_function_graphs (database_id, name);

CREATE TABLE constructive_compute_public.platform_function_invocations (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_compute_public.platform_function_invocations 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.platform_function_invocations IS 'Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.actor_id IS 'Who triggered the invocation (NULL for system/cron)';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN completed_at timestamptz;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.completed_at IS 'When execution completed';

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.created_at IS 'Invocation creation timestamp (partition key)';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN duration_ms int;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.duration_ms IS 'Wall-clock execution time in milliseconds';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN error text;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.error IS 'Error message when status is failed';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN graph_execution_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.graph_execution_id IS 'Groups all node invocations from a single flow graph execution';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.id IS 'Unique invocation identifier';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN job_id bigint;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.job_id IS 'FK to app_jobs.jobs — the underlying transport';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN parent_invocation_id uuid;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.parent_invocation_id IS 'Parent invocation when this is a child node of a flow graph execution';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN payload jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.payload IS 'Function input payload';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN result jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.result IS 'Function return value (success) or structured error (failure)';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN started_at timestamptz;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.started_at IS 'When execution started';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN status text;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.status IS 'Lifecycle: pending → running → completed/failed/cancelled';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD CONSTRAINT platform_function_invocations_status_chk 
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD COLUMN task_identifier text;

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ALTER COLUMN task_identifier SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_function_invocations.task_identifier IS 'Function routing slug (scope:name). Links to function_definitions.task_identifier by convention — no FK.';

ALTER TABLE constructive_compute_public.platform_function_invocations 
  ADD CONSTRAINT platform_function_invocations_pkey PRIMARY KEY (created_at, id);

CREATE INDEX platform_function_invocations_actor_id_created_at_idx ON constructive_compute_public.platform_function_invocations (actor_id, created_at);

CREATE INDEX platform_function_invocations_graph_execution_id_created_at_idx ON constructive_compute_public.platform_function_invocations (graph_execution_id, created_at);

CREATE INDEX platform_function_invocations_task_identifier_created_at_idx ON constructive_compute_public.platform_function_invocations (task_identifier, created_at);



CREATE TABLE constructive_compute_public.platform_secret_definitions ();

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_compute_public.platform_secret_definitions IS 'Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN annotations jsonb;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN annotations SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.annotations IS 'Freeform metadata annotations for secret definitions';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.description IS 'Human-readable description of what this secret is used for';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN id uuid;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN is_built_in boolean;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN is_built_in SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.is_built_in IS 'Whether this row was seeded as a built-in secret definition. Built-in rows are immutable.';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN labels jsonb;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN labels SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.labels IS 'Key-value metadata for filtering and grouping secret definitions';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN name text;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_compute_public.platform_secret_definitions.name IS 'Secret name (must match app_secrets.name for resolution)';

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD CONSTRAINT platform_secret_definitions_name_key 
    UNIQUE (name);

ALTER TABLE constructive_compute_public.platform_secret_definitions 
  ADD CONSTRAINT platform_secret_definitions_pkey PRIMARY KEY (id);

CREATE INDEX platform_secret_definitions_created_at_idx ON constructive_compute_public.platform_secret_definitions (created_at);

CREATE INDEX platform_secret_definitions_updated_at_idx ON constructive_compute_public.platform_secret_definitions (updated_at);

CREATE TRIGGER timestamps_tg
  BEFORE INSERT OR UPDATE
  ON constructive_compute_public.platform_secret_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE stamps.timestamps();

CREATE TYPE constructive_compute_public.function_requirement AS (name text, required boolean);

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN required_configs constructive_compute_public.function_requirement[];

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN required_configs SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN required_configs SET DEFAULT CAST(ARRAY[] AS constructive_compute_public.function_requirement[]);

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.required_configs IS 'Embedded config requirements: array of (name, required) tuples';

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ADD COLUMN required_secrets constructive_compute_public.function_requirement[];

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN required_secrets SET NOT NULL;

ALTER TABLE constructive_compute_public.platform_function_definitions 
  ALTER COLUMN required_secrets SET DEFAULT CAST(ARRAY[] AS constructive_compute_public.function_requirement[]);

COMMENT ON COLUMN constructive_compute_public.platform_function_definitions.required_secrets IS 'Embedded secret requirements: array of (name, required) tuples';