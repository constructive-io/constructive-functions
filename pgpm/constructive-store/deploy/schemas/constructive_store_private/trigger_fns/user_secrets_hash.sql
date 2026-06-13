-- Deploy: schemas/constructive_store_private/trigger_fns/user_secrets_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema


CREATE FUNCTION "constructive_store_private".user_secrets_hash() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF NEW.algo = 'crypt' THEN
    SELECT public.crypt(NEW.value::text, public.gen_salt('bf')) INTO NEW.value;
  ELSE
    IF NEW.algo = 'pgp' THEN
      SELECT public.pgp_sym_encrypt(pg_catalog.encode(NEW.value::bytea, 'hex'), NEW.owner_id::text, 'compress-algo=1, cipher-algo=aes256') INTO NEW.value;
    ELSE
      SELECT 'none' INTO NEW.algo;
    END IF;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

