-- Deploy: schemas/constructive_compute_private/procedures/platform_serialize_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_serialize_graph(
  IN graph_id uuid
) RETURNS jsonb AS $_PGFN_$
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
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

