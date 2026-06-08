-- Deploy: schemas/constructive_store_private/procedures/user_state_get/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


CREATE FUNCTION "constructive_store_private".user_state_get(
  IN owner_id uuid,
  IN secret_name text,
  IN default_value text DEFAULT NULL
) RETURNS text AS $_PGFN_$
DECLARE
  val text;
BEGIN
  SELECT value
  FROM "constructive_store_private".user_state AS t
  WHERE
    t.owner_id = user_state_get.owner_id AND t.name = user_state_get.secret_name INTO val;
  IF NOT (FOUND) OR val IS NULL THEN
    RETURN default_value;
  END IF;
  RETURN val;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

