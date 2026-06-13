-- Deploy: schemas/constructive_compute_private/procedures/platform_insert_subnet_nodes/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE FUNCTION "constructive_compute_private".platform_insert_subnet_nodes(
  IN database_id uuid,
  IN root_hash uuid,
  IN base_path text[],
  IN nodes_json jsonb,
  IN edges_json jsonb DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
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
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

