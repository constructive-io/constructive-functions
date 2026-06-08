-- Deploy: schemas/constructive_fbp_public/procedures/create_function_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema


CREATE FUNCTION "constructive_fbp_public".create_function_graph(
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
  INSERT INTO "constructive_fbp_public".graph_store (
    database_id,
    name
  )
  VALUES
    (create_function_graph.database_id, create_function_graph.name)
  RETURNING id INTO v_store_id;
  PERFORM "constructive_fbp_public".graph_init_empty_repo(create_function_graph.database_id, v_store_id);
  INSERT INTO "constructive_fbp_public".function_graphs (
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
    (create_function_graph.database_id, v_store_id, create_function_graph.name, create_function_graph.description, create_function_graph.context, create_function_graph.entity_id, create_function_graph.created_by, create_function_graph.definitions_commit_id)
  RETURNING id INTO v_graph_id;
  RETURN v_graph_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

