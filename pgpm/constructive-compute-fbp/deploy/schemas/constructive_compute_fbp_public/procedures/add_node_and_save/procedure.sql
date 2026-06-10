-- Deploy: schemas/constructive_compute_fbp_public/procedures/add_node_and_save/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".add_node_and_save(
  IN graph_id uuid,
  IN node_name text,
  IN node_type text,
  IN props jsonb DEFAULT NULL,
  IN meta jsonb DEFAULT NULL,
  IN message text DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_graph "constructive_compute_fbp_public".function_graphs;
  v_root_hash uuid;
BEGIN
  SELECT *
  FROM "constructive_compute_fbp_public".function_graphs
  WHERE
    id = add_node_and_save.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_compute_fbp_public".platform_function_graph_ref AS r INNER JOIN "constructive_compute_fbp_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  v_root_hash := "constructive_compute_fbp_public".add_node(v_graph.database_id, v_root_hash, add_node_and_save.node_name, add_node_and_save.node_type, v_graph.context, v_graph.name, add_node_and_save.props, add_node_and_save.meta);
  PERFORM "constructive_compute_fbp_public".save_graph(add_node_and_save.graph_id, v_root_hash, coalesce(add_node_and_save.message, 'add node: ' || add_node_and_save.node_name));
  RETURN add_node_and_save.graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

