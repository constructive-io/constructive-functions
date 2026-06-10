-- Deploy: schemas/constructive_compute_fbp_private/procedures/copy_subtree/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema


CREATE FUNCTION "constructive_compute_fbp_private".copy_subtree(
  IN source_scope_id uuid,
  IN source_commit_id uuid,
  IN source_path text[],
  IN target_scope_id uuid,
  IN target_root_hash uuid,
  IN target_path text[]
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_source_tree_id uuid;
  v_root_hash uuid;
  v_row record;
  v_rel_path text[];
  v_new_path text[];
  v_src_len int;
BEGIN
  SELECT tree_id
  FROM "constructive_compute_fbp_public".platform_function_graph_commit
  WHERE
    id = copy_subtree.source_commit_id AND database_id = copy_subtree.source_scope_id INTO v_source_tree_id;
  IF v_source_tree_id IS NULL THEN
    RAISE EXCEPTION 'source commit not found';
  END IF;
  v_src_len := cardinality(copy_subtree.source_path);
  v_root_hash := copy_subtree.target_root_hash;
  FOR v_row IN SELECT
    path,
    data
  FROM "constructive_compute_fbp_public".platform_function_graph_get_all(copy_subtree.source_scope_id, v_source_tree_id)
  WHERE
    (path)[1:v_src_len] = copy_subtree.source_path AND cardinality(path) > v_src_len LOOP
    v_rel_path := (v_row.path)[v_src_len + 1:];
    v_new_path := copy_subtree.target_path || v_rel_path;
    v_root_hash := "constructive_compute_fbp_public".platform_function_graph_insert_node_at_path(copy_subtree.target_scope_id, v_root_hash, v_new_path, v_row.data, '{}'::uuid[], '{}'::text[]);
  END LOOP;
  RETURN v_root_hash;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

