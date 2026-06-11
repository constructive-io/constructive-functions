-- Deploy: schemas/constructive_compute_public/procedures/platform_read_function_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE FUNCTION "constructive_compute_public".platform_read_function_graph(
  IN graph_id uuid
) RETURNS jsonb AS $_PGFN_$
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
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

