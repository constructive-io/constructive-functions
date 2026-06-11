-- Deploy: schemas/constructive_compute_public/procedures/platform_add_node/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE FUNCTION "constructive_compute_public".platform_add_node(
  IN database_id uuid,
  IN root_hash uuid,
  IN node_name text,
  IN node_type text,
  IN context text,
  IN graph_name text,
  IN props jsonb DEFAULT NULL,
  IN meta jsonb DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_path text[];
  v_segments text[];
  v_node_data jsonb;
  v_i integer;
BEGIN
  v_segments := string_to_array(platform_add_node.node_name, '/');
  v_path := ARRAY[platform_add_node.context, 'graphs', platform_add_node.graph_name];
  FOR v_i IN 1..array_length(v_segments, 1) LOOP
    v_path := v_path || ARRAY['nodes', (v_segments)[v_i]];
  END LOOP;
  v_node_data := jsonb_build_object('type', platform_add_node.node_type);
  IF platform_add_node.meta IS NOT NULL THEN
    v_node_data := v_node_data || jsonb_build_object('meta', platform_add_node.meta);
  END IF;
  IF platform_add_node.props IS NOT NULL THEN
    v_node_data := v_node_data || jsonb_build_object('props', platform_add_node.props);
  END IF;
  RETURN "constructive_platform_function_graph_public".insert_node_at_path(platform_add_node.database_id, platform_add_node.root_hash, v_path, v_node_data, '{}'::uuid[], '{}'::text[]);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

