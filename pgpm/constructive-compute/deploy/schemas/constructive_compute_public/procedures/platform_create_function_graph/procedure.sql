-- Deploy: schemas/constructive_compute_public/procedures/platform_create_function_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE FUNCTION "constructive_compute_public".platform_create_function_graph(
  IN database_id uuid,
  IN name text,
  IN context text DEFAULT 'function',
  IN description text DEFAULT NULL,
  IN entity_id uuid DEFAULT NULL,
  IN created_by uuid DEFAULT NULL,
  IN definitions_commit_id uuid DEFAULT NULL
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_store_id uuid;
  v_graph_id uuid;
BEGIN
  SELECT s.id
  FROM "constructive_platform_function_graph_public".platform_function_graph_store AS s
  WHERE
    s.database_id = platform_create_function_graph.database_id
    AND s.name = platform_create_function_graph.name
  INTO v_store_id;
  IF v_store_id IS NULL THEN
    INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_store (
      database_id,
      name
    )
    VALUES
      (platform_create_function_graph.database_id, platform_create_function_graph.name)
    RETURNING id INTO v_store_id;
    PERFORM "constructive_platform_function_graph_public".init_empty_repo(platform_create_function_graph.database_id, v_store_id);
  END IF;
  INSERT INTO "constructive_compute_public".platform_function_graphs (
    database_id,
    store_id,
    name,
    description,
    context,
    entity_id,
    created_by,
    definitions_commit_id
  )
  VALUES
    (platform_create_function_graph.database_id, v_store_id, platform_create_function_graph.name, platform_create_function_graph.description, platform_create_function_graph.context, platform_create_function_graph.entity_id, platform_create_function_graph.created_by, platform_create_function_graph.definitions_commit_id)
  RETURNING id INTO v_graph_id;
  RETURN v_graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

