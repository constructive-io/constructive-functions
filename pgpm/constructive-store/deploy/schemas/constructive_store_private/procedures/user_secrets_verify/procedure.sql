-- Deploy: schemas/constructive_store_private/procedures/user_secrets_verify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


CREATE FUNCTION "constructive_store_private".user_secrets_verify(
  IN owner_id uuid,
  IN secret_name text,
  IN value text
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_secret_text text;
  v_secret "constructive_store_private".user_secrets;
BEGIN
  SELECT "constructive_store_private".user_secrets_get(user_secrets_verify.owner_id, user_secrets_verify.secret_name) INTO v_secret_text;
  SELECT *
  FROM "constructive_store_private".user_secrets AS s
  WHERE
    s.name = user_secrets_verify.secret_name AND s.owner_id = user_secrets_verify.owner_id INTO v_secret;
  IF v_secret.algo = 'crypt' THEN
    RETURN v_secret_text = public.crypt(user_secrets_verify.value::bytea::text, v_secret_text);
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN user_secrets_verify.value = v_secret_text;
  END IF;
  RETURN user_secrets_verify.value = v_secret_text;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

