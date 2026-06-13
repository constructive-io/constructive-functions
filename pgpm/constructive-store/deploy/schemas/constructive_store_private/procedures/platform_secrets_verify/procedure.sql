-- Deploy: schemas/constructive_store_private/procedures/platform_secrets_verify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


CREATE FUNCTION "constructive_store_private".platform_secrets_verify(
  IN secret_name text,
  IN value text,
  IN secret_namespace text DEFAULT 'default'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_secret_text text;
  v_secret "constructive_store_private".platform_secrets;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = platform_secrets_verify.secret_namespace INTO v_namespace_id;
  SELECT "constructive_store_private".platform_secrets_get(platform_secrets_verify.secret_name, NULL::text, platform_secrets_verify.secret_namespace) INTO v_secret_text;
  SELECT *
  FROM "constructive_store_private".platform_secrets AS s
  WHERE
    s.namespace_id = v_namespace_id AND s.name = platform_secrets_verify.secret_name INTO v_secret;
  IF v_secret.algo = 'crypt' THEN
    RETURN v_secret_text = public.crypt(platform_secrets_verify.value::bytea::text, v_secret_text);
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN platform_secrets_verify.value = v_secret_text;
  END IF;
  RETURN platform_secrets_verify.value = v_secret_text;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

