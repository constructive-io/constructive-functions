-- Deploy: schemas/constructive_store_public/procedures/org_secrets_remove_array/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


CREATE FUNCTION "constructive_store_public".org_secrets_remove_array(
  IN owner_id uuid,
  IN secret_names text[],
  IN secret_namespace text DEFAULT 'default'
) RETURNS void AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM "constructive_infra_public".platform_namespaces AS ns
  WHERE
    ns.name = org_secrets_remove_array.secret_namespace INTO v_namespace_id;
  DELETE FROM "constructive_store_private".org_secrets AS s
  WHERE
    (s.owner_id = org_secrets_remove_array.owner_id AND s.namespace_id = v_namespace_id) AND s.name = ANY( org_secrets_remove_array.secret_names );
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

