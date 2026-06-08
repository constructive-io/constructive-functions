-- Deploy: schemas/constructive_fbp_public/procedures/import_definitions/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema


CREATE FUNCTION "constructive_fbp_public".import_definitions(
  IN graph_id uuid,
  IN source_scope_id uuid,
  IN source_commit_id uuid,
  IN contexts text[]
) RETURNS void AS $_PGFN_$
DECLARE
  v_graph "constructive_fbp_public".function_graphs;
  v_root_hash uuid;
  v_ctx text;
  v_i int;
BEGIN
  SELECT *
  FROM "constructive_fbp_public".function_graphs
  WHERE
    id = import_definitions.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  SELECT c.tree_id
  FROM "constructive_fbp_public".graph_ref AS r INNER JOIN "constructive_fbp_public".graph_commit AS c ON c.id = r.commit_id AND c.database_id = r.database_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main' INTO v_root_hash;
  FOR v_i IN 1..cardinality(import_definitions.contexts) LOOP
    v_ctx := (import_definitions.contexts)[v_i];
    v_root_hash := "constructive_fbp_private".copy_subtree(import_definitions.source_scope_id, import_definitions.source_commit_id, ARRAY[v_ctx, 'definitions'], v_graph.database_id, v_root_hash, ARRAY[v_ctx, 'definitions']);
  END LOOP;
  PERFORM "constructive_fbp_public".save_graph(import_definitions.graph_id, v_root_hash, 'import definitions');
  RETURN;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

