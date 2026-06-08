-- Deploy: schemas/constructive_objects_public/procedures/init_empty_repo/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema


CREATE FUNCTION "constructive_objects_public".init_empty_repo(
  IN s_id uuid,
  IN store_id uuid
) RETURNS void AS $_PGFN_$
DECLARE
  v_tree_id uuid;
  v_commit_id uuid;
  v_ref_id uuid;
BEGIN
  IF EXISTS (SELECT 1
  FROM "constructive_objects_public".commit AS c
  WHERE
    c.database_id = s_id AND c.store_id = init_empty_repo.store_id) THEN
    RAISE EXCEPTION 'REPO_EXISTS';
  END IF;
  INSERT INTO "constructive_objects_public".object (
    database_id
  )
  VALUES
    (s_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_tree_id;
  INSERT INTO "constructive_objects_public".ref (
    database_id,
    store_id,
    name
  )
  VALUES
    (s_id, init_empty_repo.store_id, 'main')
  RETURNING id INTO v_ref_id;
  INSERT INTO "constructive_objects_public".commit (
    database_id,
    store_id,
    message,
    tree_id
  )
  VALUES
    (s_id, init_empty_repo.store_id, 'first commit', v_tree_id)
  RETURNING id INTO v_commit_id;
  UPDATE "constructive_objects_public".ref SET
  commit_id = v_commit_id
  WHERE
    id = v_ref_id AND database_id = s_id;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

