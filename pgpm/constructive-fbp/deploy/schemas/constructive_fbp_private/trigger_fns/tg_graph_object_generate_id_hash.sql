-- Deploy: schemas/constructive_fbp_private/trigger_fns/tg_graph_object_generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema


CREATE FUNCTION "constructive_fbp_private".tg_graph_object_generate_id_hash() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  NEW.id := "constructive_fbp_private".graph_object_hash_uuid(NEW);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

