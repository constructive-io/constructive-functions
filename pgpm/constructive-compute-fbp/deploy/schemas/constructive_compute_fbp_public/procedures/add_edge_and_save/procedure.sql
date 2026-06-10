-- Deploy: schemas/constructive_compute_fbp_public/procedures/add_edge_and_save/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".add_edge_and_save(
  IN graph_id uuid,
  IN src_node text,
  IN src_port text,
  IN dst_node text,
  IN dst_port text,
  IN message text DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_graph "constructive_compute_fbp_public".function_graphs;
  v_root_hash uuid;
BEGIN
  SELECT *
  FROM "constructive_compute_fbp_public".function_graphs
  WHERE
    id = add_edge_and_save.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_compute_fbp_public".platform_function_graph_ref AS r INNER JOIN "constructive_compute_fbp_public".platform_function_graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  v_root_hash := "constructive_compute_fbp_public".add_edge(v_graph.database_id, v_root_hash, add_edge_and_save.src_node, add_edge_and_save.src_port, add_edge_and_save.dst_node, add_edge_and_save.dst_port, v_graph.context, v_graph.name);
  PERFORM "constructive_compute_fbp_public".save_graph(add_edge_and_save.graph_id, v_root_hash, coalesce(add_edge_and_save.message, 'add edge' || add_edge_and_save.src_node));
  RETURN add_edge_and_save.graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

