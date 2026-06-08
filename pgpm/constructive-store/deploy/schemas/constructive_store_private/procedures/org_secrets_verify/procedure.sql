-- Deploy: schemas/constructive_store_private/procedures/org_secrets_verify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


CREATE FUNCTION "constructive_store_private".org_secrets_verify(
  IN owner_id uuid,
  IN secret_name text,
  IN value text,
  IN secret_namespace text DEFAULT 'default'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_secret_text text;
  v_secret "constructive_store_private".org_secrets;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = org_secrets_verify.secret_namespace INTO v_namespace_id;
  SELECT "constructive_store_private".org_secrets_get(org_secrets_verify.owner_id, org_secrets_verify.secret_name, NULL::text, org_secrets_verify.secret_namespace) INTO v_secret_text;
  SELECT *
  FROM "constructive_store_private".org_secrets AS s
  WHERE
    (s.owner_id = org_secrets_verify.owner_id AND s.namespace_id = v_namespace_id) AND s.name = org_secrets_verify.secret_name INTO v_secret;
  IF v_secret.algo = 'crypt' THEN
    RETURN v_secret_text = public.crypt(org_secrets_verify.value::bytea::text, v_secret_text);
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN org_secrets_verify.value = v_secret_text;
  END IF;
  RETURN org_secrets_verify.value = v_secret_text;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

