-- Deploy: schemas/constructive_platform_function_graph_public/procedures/get_node_at_path/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema


CREATE FUNCTION "constructive_platform_function_graph_public".get_node_at_path(
  IN s_id uuid,
  IN id uuid,
  IN path text[] DEFAULT ARRAY[]::text[]
) RETURNS "constructive_platform_function_graph_public".platform_function_graph_object AS $_PGFN_$
DECLARE
  _path text[] := path;
  _obj "constructive_platform_function_graph_public".platform_function_graph_object;
  i int;
  pos int;
  curpath text;
  _node_id uuid;
BEGIN
  SELECT *
  FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
  WHERE
    o.id = get_node_at_path.id AND o.database_id = s_id INTO _obj;
  IF array_length(_path, 1) > 0 THEN
    FOR i IN SELECT *
    FROM generate_subscripts(_path, 1) AS g (i) LOOP
      curpath := (_path)[1];
      pos := object_store_utils.array_index_of(_obj.ktree, curpath);
      IF pos > 0 THEN
        _node_id := (_obj.kids)[pos];
        SELECT *
        FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
        WHERE
          o.id = _node_id AND o.database_id = s_id INTO _obj;
        IF array_length(_path, 1) = 1 THEN
          RETURN _obj;
        END IF;
      END IF;
      _path := object_store_utils.array_shift(_path);
    END LOOP;
  ELSE
    RETURN _obj;
  END IF;
  RETURN NULL;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

