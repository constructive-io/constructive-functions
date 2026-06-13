-- Deploy: schemas/constructive_store_public/procedures/platform_secrets_del/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


CREATE FUNCTION "constructive_store_public".platform_secrets_del(
  IN secret_name text,
  IN secret_namespace text DEFAULT 'default'
) RETURNS void AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = platform_secrets_del.secret_namespace INTO v_namespace_id;
  DELETE FROM "constructive_store_private".platform_secrets AS s
  WHERE
    s.namespace_id = v_namespace_id AND s.name = platform_secrets_del.secret_name;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

