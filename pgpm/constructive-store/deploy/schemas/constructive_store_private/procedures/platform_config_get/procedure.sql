-- Deploy: schemas/constructive_store_private/procedures/platform_config_get/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table


CREATE FUNCTION "constructive_store_private".platform_config_get(
  IN config_name text,
  IN default_value text DEFAULT NULL,
  IN config_namespace text DEFAULT 'default'
) RETURNS text AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_value text;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = platform_config_get.config_namespace INTO v_namespace_id;
  SELECT c.value
  FROM "constructive_store_public".platform_config AS c
  WHERE
    c.namespace_id = v_namespace_id AND c.name = platform_config_get.config_name INTO v_value;
  IF NOT (FOUND) OR v_value IS NULL THEN
    RETURN platform_config_get.default_value;
  END IF;
  RETURN v_value;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

