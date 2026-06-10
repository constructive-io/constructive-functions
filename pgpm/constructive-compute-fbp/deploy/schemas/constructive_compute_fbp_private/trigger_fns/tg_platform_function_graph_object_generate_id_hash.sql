-- Deploy: schemas/constructive_compute_fbp_private/trigger_fns/tg_platform_function_graph_object_generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema


CREATE FUNCTION "constructive_compute_fbp_private".tg_platform_function_graph_object_generate_id_hash() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  NEW.id := "constructive_compute_fbp_private".platform_function_graph_object_hash_uuid(NEW);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

