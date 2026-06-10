-- Deploy: schemas/constructive_compute_fbp_public/procedures/validate_function_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".validate_function_graph(
  IN graph_id uuid
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_graph "constructive_compute_fbp_public".function_graphs;
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
  FROM "constructive_compute_fbp_public".function_graphs
  WHERE
    id = validate_function_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_compute_fbp_public".platform_function_graph_ref AS r INNER JOIN "constructive_compute_fbp_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_tree_id;
  IF v_tree_id IS NULL THEN
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('code', 'NO_TREE', 'message', 'No object tree found for graph'));
    UPDATE "constructive_compute_fbp_public".function_graphs SET
    is_valid = false, validation_errors = v_errors, updated_at = now()
    WHERE
      id = validate_function_graph.graph_id;
    RETURN false;
  END IF;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_compute_fbp_public".platform_function_graph_get_all(v_graph.database_id, v_tree_id)
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
  FROM "constructive_compute_fbp_public".platform_function_graph_get_all(v_graph.database_id, v_tree_id)
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
  UPDATE "constructive_compute_fbp_public".function_graphs SET
  is_valid = v_is_valid, validation_errors = CASE 
    WHEN v_is_valid THEN NULL 
    ELSE v_errors 
  END, updated_at = now()
  WHERE
    id = validate_function_graph.graph_id;
  RETURN v_is_valid;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

