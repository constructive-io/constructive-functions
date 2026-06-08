-- Deploy: schemas/constructive_fbp_private/procedures/graph_object_hash_uuid/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema


CREATE FUNCTION "constructive_fbp_private".graph_object_hash_uuid(
  IN obj "constructive_fbp_public".graph_object
) RETURNS uuid AS $_PGFN_$
DECLARE
  v_cash jsonb := '{}'::jsonb;
  v_hash1 uuid;
  v_hash2 uuid;
BEGIN
  IF obj.data IS NOT NULL THEN
    v_hash1 := uuid_generate_v5(uuid_ns_url(), obj.data::text);
  END IF;
  IF obj.kids IS NOT NULL AND obj.ktree IS NOT NULL THEN
    v_cash := json_object(obj.ktree::text[], obj.kids::text[]);
    v_hash2 := uuid_generate_v5(uuid_ns_url(), v_cash::text);
  END IF;
  RETURN uuid_generate_v5(uuid_ns_url(), (concat(v_hash1, v_hash2))::text);
END;
$_PGFN_$ LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER;

