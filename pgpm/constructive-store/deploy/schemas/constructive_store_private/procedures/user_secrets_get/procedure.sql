-- Deploy: schemas/constructive_store_private/procedures/user_secrets_get/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


CREATE FUNCTION "constructive_store_private".user_secrets_get(
  IN owner_id uuid,
  IN secret_name text,
  IN default_value text DEFAULT NULL
) RETURNS text AS $_PGFN_$
DECLARE
  v_secret "constructive_store_private".user_secrets;
BEGIN
  SELECT *
  FROM "constructive_store_private".user_secrets AS s
  WHERE
    s.name = user_secrets_get.secret_name AND s.owner_id = user_secrets_get.owner_id INTO v_secret;
  IF NOT (FOUND) OR v_secret IS NULL THEN
    RETURN user_secrets_get.default_value;
  END IF;
  IF v_secret.algo = 'crypt' THEN
    RETURN pg_catalog.convert_from(v_secret.value, 'SQL_ASCII');
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN pg_catalog.convert_from(pg_catalog.decode(public.pgp_sym_decrypt(v_secret.value, v_secret.owner_id::text), 'hex'), 'SQL_ASCII');
  END IF;
  RETURN pg_catalog.convert_from(v_secret.value, 'SQL_ASCII');
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

