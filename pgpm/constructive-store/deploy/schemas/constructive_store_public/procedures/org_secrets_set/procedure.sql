-- Deploy: schemas/constructive_store_public/procedures/org_secrets_set/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


CREATE FUNCTION "constructive_store_public".org_secrets_set(
  IN owner_id uuid,
  IN secret_name text,
  IN secret_value text,
  IN algo text DEFAULT 'pgp',
  IN secret_namespace text DEFAULT 'default'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = org_secrets_set.secret_namespace INTO v_namespace_id;
  INSERT INTO "constructive_store_private".org_secrets (
    owner_id,
    namespace_id,
    name,
    value,
    algo
  )
  VALUES
    (org_secrets_set.owner_id, v_namespace_id, org_secrets_set.secret_name, org_secrets_set.secret_value::bytea, org_secrets_set.algo)
  ON CONFLICT (owner_id, namespace_id, name) DO UPDATE SET
  value = org_secrets_set.secret_value::bytea, algo = EXCLUDED.algo;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

