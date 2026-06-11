-- Deploy: schemas/constructive_compute_fbp_public/procedures/platform_function_graph_get_all/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema


CREATE FUNCTION "constructive_compute_fbp_public".platform_function_graph_get_all(
  IN s_id uuid,
  IN id uuid
) RETURNS TABLE(path text[], data jsonb) AS $_PGFN_$
DECLARE
  root "constructive_compute_fbp_public".platform_function_graph_object;
  i int;
  cid uuid;
  cname text;
  rpath text[];
  rdata jsonb;
BEGIN
  SELECT *
  FROM "constructive_compute_fbp_public".platform_function_graph_object AS o
  WHERE
    o.database_id = s_id AND o.id = platform_function_graph_get_all.id INTO root;
  FOR i IN SELECT *
  FROM generate_series(1, cardinality(root.kids)) LOOP
    cid := (root.kids)[i];
    cname := (root.ktree)[i];
    FOR rpath, rdata IN SELECT *
    FROM "constructive_compute_fbp_public".platform_function_graph_get_all(s_id, cid) LOOP
      path := ARRAY[cname] || rpath;
      data := rdata;
      RETURN NEXT;
    END LOOP;
  END LOOP;
  path := ARRAY[]::text[];
  data := root.data;
  RETURN NEXT;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

