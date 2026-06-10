-- Deploy: schemas/constructive_compute_fbp_public/procedures/copy_graph/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".copy_graph(
  IN database_id uuid,
  IN graph_id uuid,
  IN name text
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_snapshot jsonb;
BEGIN
  v_snapshot := "constructive_compute_fbp_private".serialize_graph(copy_graph.graph_id);
  RETURN "constructive_compute_fbp_private".deserialize_graph(copy_graph.database_id, copy_graph.name, v_snapshot);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

