-- Deploy: schemas/constructive_fbp_public/procedures/add_edge/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema


CREATE FUNCTION "constructive_fbp_public".add_edge(
  IN database_id uuid,
  IN root_hash uuid,
  IN src_node text,
  IN src_port text,
  IN dst_node text,
  IN dst_port text,
  IN context text,
  IN graph_name text
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_edge_count integer := 0;
  v_scope_path text[];
  v_row record;
  v_edge_data jsonb;
  v_src_segments text[];
  v_dst_segments text[];
BEGIN
  FOR v_row IN SELECT *
  FROM "constructive_fbp_public".graph_get_all(add_edge.database_id, add_edge.root_hash)
  WHERE
    (cardinality(path) = 5 AND (path)[4] = 'edges') AND ((path)[1] = add_edge.context AND ((path)[2] = 'graphs' AND (path)[3] = add_edge.graph_name)) LOOP
    v_edge_count := v_edge_count + 1;
  END LOOP;
  v_scope_path := ARRAY[add_edge.context, 'graphs', add_edge.graph_name, 'edges', v_edge_count::text];
  v_edge_data := jsonb_build_object('src', jsonb_build_object('node', add_edge.src_node, 'port', add_edge.src_port), 'dst', jsonb_build_object('node', add_edge.dst_node, 'port', add_edge.dst_port));
  RETURN "constructive_fbp_public".graph_insert_node_at_path(add_edge.database_id, add_edge.root_hash, v_scope_path, v_edge_data, '{}'::uuid[], '{}'::text[]);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

