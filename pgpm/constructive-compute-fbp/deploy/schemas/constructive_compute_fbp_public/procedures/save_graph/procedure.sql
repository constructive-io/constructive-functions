-- Deploy: schemas/constructive_compute_fbp_public/procedures/save_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".save_graph(
  IN graph_id uuid,
  IN root_hash uuid,
  IN message text DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_graph "constructive_compute_fbp_public".function_graphs;
  v_commit_id uuid;
  v_msg text;
BEGIN
  SELECT *
  FROM "constructive_compute_fbp_public".function_graphs
  WHERE
    id = save_graph.graph_id INTO v_graph;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'function_graph not found';
  END IF;
  v_msg := coalesce(save_graph.message, (now())::text);
  INSERT INTO "constructive_compute_fbp_public".platform_function_graph_commit (
    database_id,
    store_id,
    message,
    parent_ids,
    tree_id
  )
  SELECT
    r.database_id,
    r.store_id,
    v_msg,
    ARRAY[r.commit_id]::uuid[],
    save_graph.root_hash
  FROM "constructive_compute_fbp_public".platform_function_graph_ref AS r
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main'
  RETURNING id INTO v_commit_id;
  UPDATE "constructive_compute_fbp_public".platform_function_graph_ref AS r SET
  commit_id = v_commit_id
  WHERE
    (r.database_id = v_graph.database_id AND r.store_id = v_graph.store_id) AND r.name = 'main';
  UPDATE "constructive_compute_fbp_public".function_graphs SET
  is_valid = false, validation_errors = NULL, updated_at = now()
  WHERE
    id = save_graph.graph_id;
  RETURN v_commit_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

