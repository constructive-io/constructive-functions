-- Deploy: schemas/constructive_store_public/procedures/platform_secrets_set/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


CREATE FUNCTION "constructive_store_public".platform_secrets_set(
  IN secret_name text,
  IN secret_value text,
  IN algo text DEFAULT 'pgp',
  IN secret_namespace text DEFAULT 'default',
  IN secret_database_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = platform_secrets_set.secret_namespace INTO v_namespace_id;
  INSERT INTO "constructive_store_private".platform_secrets (
    database_id,
    namespace_id,
    name,
    value,
    algo
  )
  VALUES
    (platform_secrets_set.secret_database_id, v_namespace_id, platform_secrets_set.secret_name, platform_secrets_set.secret_value::bytea, platform_secrets_set.algo)
  ON CONFLICT (database_id, namespace_id, name) DO UPDATE SET
  value = platform_secrets_set.secret_value::bytea, algo = EXCLUDED.algo;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

