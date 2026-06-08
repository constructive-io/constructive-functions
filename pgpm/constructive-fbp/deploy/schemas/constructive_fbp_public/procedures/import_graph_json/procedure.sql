-- Deploy: schemas/constructive_fbp_public/procedures/import_graph_json/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema


CREATE FUNCTION "constructive_fbp_public".import_graph_json(
  IN database_id uuid,
  IN name text,
  IN graph_json jsonb,
  IN context text DEFAULT NULL,
  IN description text DEFAULT NULL,
  IN entity_id uuid DEFAULT NULL,
  IN created_by uuid DEFAULT NULL,
  IN definitions_commit_id uuid DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_graph_id uuid;
  v_graph "constructive_fbp_public".function_graphs;
  v_root_hash uuid;
  v_context text;
  v_node jsonb;
  v_edge jsonb;
  v_node_name text;
  v_edge_idx int := 0;
  v_def jsonb;
BEGIN
  v_context := coalesce(import_graph_json.context, import_graph_json.graph_json->>'context', 'function');
  v_graph_id := "constructive_fbp_public".create_function_graph(import_graph_json.database_id, import_graph_json.name, v_context, import_graph_json.description, import_graph_json.entity_id, import_graph_json.created_by, import_graph_json.definitions_commit_id);
  SELECT *
  FROM "constructive_fbp_public".function_graphs
  WHERE
    id = v_graph_id INTO v_graph;
  SELECT c.tree_id
  FROM "constructive_fbp_public".graph_ref AS r INNER JOIN "constructive_fbp_public".graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  IF import_graph_json.graph_json ? 'nodes' THEN
    FOR v_node IN SELECT *
    FROM jsonb_array_elements(import_graph_json.graph_json->'nodes') LOOP
      v_node_name := v_node->>'name';
      v_root_hash := "constructive_fbp_public".add_node(v_graph.database_id, v_root_hash, v_node_name, v_node->>'type', v_graph.context, v_graph.name, v_node->'props', v_node->'meta');
      IF v_node ? 'nodes' THEN
        v_root_hash := "constructive_fbp_private".insert_subnet_nodes(v_graph.database_id, v_root_hash, ARRAY[v_graph.context, 'graphs', v_graph.name, 'nodes', v_node_name], v_node->'nodes', v_node->'edges');
        v_root_hash := "constructive_fbp_public".graph_insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_context, 'definitions', v_node_name], jsonb_build_object('name', v_node_name, 'context', v_graph.context, 'graph', jsonb_build_object('name', v_node_name || '_subnet', 'context', v_graph.context, 'nodes', v_node->'nodes', 'edges', v_node->'edges')), '{}'::uuid[], '{}'::text[]);
      END IF;
    END LOOP;
  END IF;
  IF import_graph_json.graph_json ? 'edges' THEN
    FOR v_edge IN SELECT *
    FROM jsonb_array_elements(import_graph_json.graph_json->'edges') LOOP
      v_root_hash := "constructive_fbp_public".graph_insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_graph.context, 'graphs', v_graph.name, 'edges', v_edge_idx::text], jsonb_build_object('src', v_edge->'src', 'dst', v_edge->'dst'), '{}'::uuid[], '{}'::text[]);
      v_edge_idx := v_edge_idx + 1;
    END LOOP;
  END IF;
  IF import_graph_json.graph_json ? 'definitions' THEN
    FOR v_def IN SELECT *
    FROM jsonb_array_elements(import_graph_json.graph_json->'definitions') LOOP
      v_root_hash := "constructive_fbp_public".graph_insert_node_at_path(v_graph.database_id, v_root_hash, ARRAY[v_context, 'definitions', v_def->>'name'], v_def, '{}'::uuid[], '{}'::text[]);
    END LOOP;
  END IF;
  PERFORM "constructive_fbp_public".save_graph(v_graph_id, v_root_hash, 'import from JSON');
  RETURN v_graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

