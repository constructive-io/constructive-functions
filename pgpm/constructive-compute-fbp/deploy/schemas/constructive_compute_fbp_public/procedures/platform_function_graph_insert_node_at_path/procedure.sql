-- Deploy: schemas/constructive_compute_fbp_public/procedures/platform_function_graph_insert_node_at_path/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".platform_function_graph_insert_node_at_path(
  IN s_id uuid,
  IN root uuid,
  IN path text[],
  IN data jsonb,
  IN kids uuid[],
  IN ktree text[]
) RETURNS uuid AS $_PGFN_$
DECLARE
  _newnode_id uuid;
  _newparent_id uuid;
  _parent "constructive_compute_fbp_public".platform_function_graph_object;
  _orig_name text;
  _repl uuid;
  _uuid_to_return uuid;
  _parent_existed bool;
  vkids uuid[];
  vktree text[];
  i int;
  _path_len int;
  _depth int;
  _pos int;
  _cur_id uuid;
  _cur_obj "constructive_compute_fbp_public".platform_function_graph_object;
  _cached "constructive_compute_fbp_public".platform_function_graph_object[];
  children_hash jsonb;
BEGIN
  _path_len := coalesce(array_length(path, 1), 0);
  SELECT *
  FROM "constructive_compute_fbp_public".platform_function_graph_object AS o
  WHERE
    o.id = platform_function_graph_insert_node_at_path.root AND o.database_id = s_id INTO _cur_obj;
  _cached := array_fill(_cur_obj, ARRAY[1]);
  _depth := 0;
  IF _cur_obj.id IS NOT NULL AND _path_len > 0 THEN
    FOR i IN 1.._path_len LOOP
      _pos := object_store_utils.array_index_of(_cur_obj.ktree, (path)[i]);
      IF _pos > 0 THEN
        _cur_id := (_cur_obj.kids)[_pos];
        SELECT *
        FROM "constructive_compute_fbp_public".platform_function_graph_object AS o
        WHERE
          o.id = _cur_id AND o.database_id = s_id INTO _cur_obj;
        _cached := array_cat(_cached, array_fill(_cur_obj, ARRAY[1]));
        _depth := i;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  END IF;
  INSERT INTO "constructive_compute_fbp_public".platform_function_graph_object (
    database_id,
    data,
    kids,
    ktree
  )
  VALUES
    (s_id, platform_function_graph_insert_node_at_path.data, platform_function_graph_insert_node_at_path.kids, platform_function_graph_insert_node_at_path.ktree)
  ON CONFLICT (id, database_id) DO UPDATE SET
  database_id = EXCLUDED.database_id
  RETURNING id INTO _newnode_id;
  IF _newnode_id IS NULL THEN
    RAISE EXCEPTION '_newnode_id failed';
  END IF;
  _orig_name := (path)[_path_len];
  _repl := _newnode_id;
  _uuid_to_return := _newnode_id;
  FOR i IN REVERSE _path_len..1 LOOP
    IF (i - 1) = 0 THEN
      _parent := (_cached)[1];
      _parent_existed := _parent.id IS NOT NULL;
    ELSIF (i - 1) <= _depth THEN
      _parent := (_cached)[i];
      _parent_existed := true;
    ELSE
      _parent_existed := false;
    END IF;
    IF _parent_existed THEN
      children_hash := object_store_utils.zip_arrays(_parent.ktree, _parent.kids);
      children_hash := jsonb_set(children_hash, ARRAY[_orig_name]::text[], to_jsonb(_repl));
      SELECT
        h.ktree,
        h.kids
      FROM object_store_utils.unzip_obj_to_ktree_and_kids(children_hash) AS h INTO vktree, vkids;
      INSERT INTO "constructive_compute_fbp_public".platform_function_graph_object (
        database_id,
        data,
        kids,
        ktree
      )
      VALUES
        (s_id, _parent.data, vkids, vktree)
      ON CONFLICT (id, database_id) DO UPDATE SET
      database_id = EXCLUDED.database_id
      RETURNING id INTO _newparent_id;
      IF _newparent_id IS NULL THEN
        RAISE EXCEPTION 'parent insert failed';
      END IF;
    ELSE
      INSERT INTO "constructive_compute_fbp_public".platform_function_graph_object (
        database_id,
        data,
        kids,
        ktree
      )
      VALUES
        (s_id, NULL, ARRAY[_repl]::uuid[], ARRAY[_orig_name]::text[])
      ON CONFLICT (id, database_id) DO UPDATE SET
      database_id = EXCLUDED.database_id
      RETURNING id INTO _newparent_id;
    END IF;
    _orig_name := (path)[i - 1];
    _repl := _newparent_id;
    _uuid_to_return := _newparent_id;
  END LOOP;
  RETURN _uuid_to_return;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

