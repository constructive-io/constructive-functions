-- Deploy: schemas/constructive_platform_function_graph_private/trigger_fns/tg_object_generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_private/schema


CREATE FUNCTION "constructive_platform_function_graph_private".tg_object_generate_id_hash() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  NEW.id := "constructive_platform_function_graph_private".object_hash_uuid(NEW);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

