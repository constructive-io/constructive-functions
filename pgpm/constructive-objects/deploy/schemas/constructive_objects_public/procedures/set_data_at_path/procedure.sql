-- Deploy: schemas/constructive_objects_public/procedures/set_data_at_path/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema


CREATE FUNCTION "constructive_objects_public".set_data_at_path(
  IN s_id uuid,
  IN root uuid,
  IN path text[],
  IN data jsonb
) RETURNS uuid AS $_PGFN_$
DECLARE
  _node "constructive_objects_public".object;
  _kids uuid[] := ARRAY[]::uuid[];
  _ktree text[] := ARRAY[]::text[];
BEGIN
  SELECT *
  FROM "constructive_objects_public".get_node_at_path(s_id, root, path) INTO _node;
  IF _node.id IS NOT NULL THEN
    _kids := _node.kids;
    _ktree := _node.ktree;
  END IF;
  RETURN "constructive_objects_public".insert_node_at_path(s_id, root, path, data, _kids, _ktree);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

