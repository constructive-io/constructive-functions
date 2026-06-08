-- Deploy: schemas/constructive_store_private/procedures/org_secrets_get/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


CREATE FUNCTION "constructive_store_private".org_secrets_get(
  IN owner_id uuid,
  IN secret_name text,
  IN default_value text DEFAULT NULL,
  IN secret_namespace text DEFAULT 'default'
) RETURNS text AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_secret "constructive_store_private".org_secrets;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = org_secrets_get.secret_namespace INTO v_namespace_id;
  SELECT *
  FROM "constructive_store_private".org_secrets AS s
  WHERE
    (s.owner_id = org_secrets_get.owner_id AND s.namespace_id = v_namespace_id) AND s.name = org_secrets_get.secret_name INTO v_secret;
  IF NOT (FOUND) OR v_secret IS NULL THEN
    RETURN org_secrets_get.default_value;
  END IF;
  IF v_secret.algo = 'crypt' THEN
    RETURN pg_catalog.convert_from(v_secret.value, 'SQL_ASCII');
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN pg_catalog.convert_from(pg_catalog.decode(public.pgp_sym_decrypt(v_secret.value, v_secret.key_id::text), 'hex'), 'SQL_ASCII');
  END IF;
  RETURN pg_catalog.convert_from(v_secret.value, 'SQL_ASCII');
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

