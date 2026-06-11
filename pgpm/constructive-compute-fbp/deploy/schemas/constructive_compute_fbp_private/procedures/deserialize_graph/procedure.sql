-- Deploy: schemas/constructive_compute_fbp_private/procedures/deserialize_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema


CREATE FUNCTION "constructive_compute_fbp_private".deserialize_graph(
  IN database_id uuid,
  IN name text,
  IN snapshot jsonb
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_store_id uuid;
  v_root_hash uuid;
  v_graph_id uuid;
  v_row record;
  v_key text;
  v_entry jsonb;
BEGIN
  INSERT INTO "constructive_compute_fbp_public".platform_function_graph_store (
    database_id,
    name
  )
  VALUES
    (deserialize_graph.database_id, deserialize_graph.name)
  RETURNING id INTO v_store_id;
  PERFORM "constructive_compute_fbp_public".platform_function_graph_init_empty_repo(deserialize_graph.database_id, v_store_id);
  FOR v_row IN SELECT *
  FROM jsonb_each(deserialize_graph.tree_data->'tree') LOOP
    v_entry := v_row.value;
    v_root_hash := "constructive_compute_fbp_public".platform_function_graph_insert_node_at_path(deserialize_graph.database_id, v_root_hash, (v_entry->'path')::text[], v_entry->'data', '{}'::uuid[], '{}'::text[]);
  END LOOP;
  INSERT INTO "constructive_compute_fbp_public".function_graphs (
    database_id,
    store_id,
    name,
    description,
    context
  )
  VALUES
    (deserialize_graph.database_id, v_store_id, deserialize_graph.name, deserialize_graph.tree_data->>'description', deserialize_graph.tree_data->>'context')
  RETURNING id INTO v_graph_id;
  UPDATE "constructive_compute_fbp_public".platform_function_graph_ref AS r SET
  commit_id = (SELECT id
  FROM "constructive_compute_fbp_public".platform_function_graph_commit
  WHERE
    database_id = deserialize_graph.database_id AND store_id = v_store_id
  ORDER BY
    created_at DESC
  LIMIT
  1)
  WHERE
    r.database_id = deserialize_graph.database_id AND (r.store_id = v_store_id AND r.name = 'main');
  RETURN v_graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

