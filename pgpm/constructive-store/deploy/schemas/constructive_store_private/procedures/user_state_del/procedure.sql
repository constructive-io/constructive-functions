-- Deploy: schemas/constructive_store_private/procedures/user_state_del/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


CREATE FUNCTION "constructive_store_private".user_state_del(
  IN owner_id uuid,
  IN secret_name text
) RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM "constructive_store_private".user_state AS s
  WHERE
    s.owner_id = user_state_del.owner_id AND s.name = secret_name;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

