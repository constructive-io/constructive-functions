-- Deploy: schemas/constructive_store_private/procedures/user_state_set/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


CREATE FUNCTION "constructive_store_private".user_state_set(
  IN user_id uuid,
  IN secret_name text,
  IN value anyelement
) RETURNS void AS $_PGFN_$
BEGIN
  INSERT INTO "constructive_store_private".user_state (
    owner_id,
    name,
    value
  )
  VALUES
    (user_state_set.user_id, user_state_set.secret_name, user_state_set.value::text)
  ON CONFLICT (owner_id, name) DO UPDATE SET
  value = EXCLUDED.value;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

