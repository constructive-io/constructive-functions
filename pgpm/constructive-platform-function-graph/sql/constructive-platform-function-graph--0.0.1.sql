\echo Use "CREATE EXTENSION constructive-platform-function-graph" to load this file. \quit
CREATE SCHEMA constructive_platform_function_graph_private;

CREATE FUNCTION constructive_platform_function_graph_private.object_hash_uuid(
  IN obj constructive_platform_function_graph_public.platform_function_graph_object
) RETURNS uuid AS $EOFCODE$
DECLARE
  v_cash jsonb := '{}'::jsonb;
  v_hash1 uuid;
  v_hash2 uuid;
BEGIN
  IF obj.data IS NOT NULL THEN
    v_hash1 := uuid_generate_v5(uuid_ns_url(), obj.data::text);
  END IF;
  IF obj.kids IS NOT NULL AND obj.ktree IS NOT NULL THEN
    v_cash := json_object(obj.ktree::text[], obj.kids::text[]);
    v_hash2 := uuid_generate_v5(uuid_ns_url(), v_cash::text);
  END IF;
  RETURN uuid_generate_v5(uuid_ns_url(), (concat(v_hash1, v_hash2))::text);
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT ALL ON FUNCTIONS TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT ALL ON FUNCTIONS TO anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT USAGE ON SEQUENCES TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_private
  GRANT ALL ON TABLES TO administrator;

CREATE FUNCTION constructive_platform_function_graph_private.tg_object_generate_id_hash() RETURNS trigger AS $EOFCODE$
BEGIN
  NEW.id := "constructive_platform_function_graph_private".object_hash_uuid(NEW);
  RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

CREATE SCHEMA constructive_platform_function_graph_public;

CREATE FUNCTION constructive_platform_function_graph_public.get_all(
  IN s_id uuid,
  IN id uuid
) RETURNS TABLE (
  path text[],
  data jsonb
) AS $EOFCODE$
DECLARE
  root "constructive_platform_function_graph_public".platform_function_graph_object;
  i int;
  cid uuid;
  cname text;
  rpath text[];
  rdata jsonb;
BEGIN
  SELECT *
  FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
  WHERE
    o.database_id = s_id AND o.id = get_all.id INTO root;
  FOR i IN SELECT *
  FROM generate_series(1, cardinality(root.kids)) LOOP
    cid := (root.kids)[i];
    cname := (root.ktree)[i];
    FOR rpath, rdata IN SELECT *
    FROM "constructive_platform_function_graph_public".get_all(s_id, cid) LOOP
      path := ARRAY[cname] || rpath;
      data := rdata;
      RETURN NEXT;
    END LOOP;
  END LOOP;
  path := ARRAY[]::text[];
  data := root.data;
  RETURN NEXT;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE FUNCTION constructive_platform_function_graph_public.get_node_at_path(
  IN s_id uuid,
  IN id uuid,
  IN path text[] DEFAULT CAST(ARRAY[] AS text[])
) RETURNS constructive_platform_function_graph_public.platform_function_graph_object AS $EOFCODE$
DECLARE
  _path text[] := path;
  _obj "constructive_platform_function_graph_public".platform_function_graph_object;
  i int;
  pos int;
  curpath text;
  _node_id uuid;
BEGIN
  SELECT *
  FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
  WHERE
    o.id = get_node_at_path.id AND o.database_id = s_id INTO _obj;
  IF array_length(_path, 1) > 0 THEN
    FOR i IN SELECT *
    FROM generate_subscripts(_path, 1) AS g (i) LOOP
      curpath := (_path)[1];
      pos := object_store_utils.array_index_of(_obj.ktree, curpath);
      IF pos > 0 THEN
        _node_id := (_obj.kids)[pos];
        SELECT *
        FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
        WHERE
          o.id = _node_id AND o.database_id = s_id INTO _obj;
        IF array_length(_path, 1) = 1 THEN
          RETURN _obj;
        END IF;
      END IF;
      _path := object_store_utils.array_shift(_path);
    END LOOP;
  ELSE
    RETURN _obj;
  END IF;
  RETURN NULL;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE FUNCTION constructive_platform_function_graph_public.init_empty_repo(
  IN s_id uuid,
  IN store_id uuid
) RETURNS void AS $EOFCODE$
DECLARE
  v_tree_id uuid;
  v_commit_id uuid;
  v_ref_id uuid;
BEGIN
  IF EXISTS (SELECT 1
  FROM "constructive_platform_function_graph_public".platform_function_graph_commit AS c
  WHERE
    c.database_id = s_id AND c.store_id = init_empty_repo.store_id) THEN
    RAISE EXCEPTION 'REPO_EXISTS';
  END IF;
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_object (
    database_id
  )
  VALUES
    (s_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_tree_id;
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_ref (
    database_id,
    store_id,
    name
  )
  VALUES
    (s_id, init_empty_repo.store_id, 'main')
  RETURNING id INTO v_ref_id;
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_commit (
    database_id,
    store_id,
    message,
    tree_id
  )
  VALUES
    (s_id, init_empty_repo.store_id, 'first commit', v_tree_id)
  RETURNING id INTO v_commit_id;
  UPDATE "constructive_platform_function_graph_public".platform_function_graph_ref SET
  commit_id = v_commit_id
  WHERE
    id = v_ref_id AND database_id = s_id;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_platform_function_graph_public.insert_node_at_path(
  IN s_id uuid,
  IN root uuid,
  IN path text[],
  IN data jsonb,
  IN kids uuid[],
  IN ktree text[]
) RETURNS uuid AS $EOFCODE$
DECLARE
  _newnode_id uuid;
  _newparent_id uuid;
  _parent "constructive_platform_function_graph_public".platform_function_graph_object;
  _orig_name text;
  _repl uuid;
  _uuid_to_return uuid;
  _parent_existed bool;
  vkids uuid[];
  vktree text[];
  i int;
  _path_len int;
  _depth int;
  _pos int;
  _cur_id uuid;
  _cur_obj "constructive_platform_function_graph_public".platform_function_graph_object;
  _cached "constructive_platform_function_graph_public".platform_function_graph_object[];
  children_hash jsonb;
BEGIN
  _path_len := coalesce(array_length(path, 1), 0);
  SELECT *
  FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
  WHERE
    o.id = insert_node_at_path.root AND o.database_id = s_id INTO _cur_obj;
  _cached := array_fill(_cur_obj, ARRAY[1]);
  _depth := 0;
  IF _cur_obj.id IS NOT NULL AND _path_len > 0 THEN
    FOR i IN 1.._path_len LOOP
      _pos := object_store_utils.array_index_of(_cur_obj.ktree, (path)[i]);
      IF _pos > 0 THEN
        _cur_id := (_cur_obj.kids)[_pos];
        SELECT *
        FROM "constructive_platform_function_graph_public".platform_function_graph_object AS o
        WHERE
          o.id = _cur_id AND o.database_id = s_id INTO _cur_obj;
        _cached := array_cat(_cached, array_fill(_cur_obj, ARRAY[1]));
        _depth := i;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  END IF;
  INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_object (
    database_id,
    data,
    kids,
    ktree
  )
  VALUES
    (s_id, insert_node_at_path.data, insert_node_at_path.kids, insert_node_at_path.ktree)
  ON CONFLICT (id, database_id) DO UPDATE SET
  database_id = EXCLUDED.database_id
  RETURNING id INTO _newnode_id;
  IF _newnode_id IS NULL THEN
    RAISE EXCEPTION '_newnode_id failed';
  END IF;
  _orig_name := (path)[_path_len];
  _repl := _newnode_id;
  _uuid_to_return := _newnode_id;
  FOR i IN REVERSE _path_len..1 LOOP
    IF (i - 1) = 0 THEN
      _parent := (_cached)[1];
      _parent_existed := _parent.id IS NOT NULL;
    ELSIF (i - 1) <= _depth THEN
      _parent := (_cached)[i];
      _parent_existed := true;
    ELSE
      _parent_existed := false;
    END IF;
    IF _parent_existed THEN
      children_hash := object_store_utils.zip_arrays(_parent.ktree, _parent.kids);
      children_hash := jsonb_set(children_hash, ARRAY[_orig_name]::text[], to_jsonb(_repl));
      SELECT
        h.ktree,
        h.kids
      FROM object_store_utils.unzip_obj_to_ktree_and_kids(children_hash) AS h INTO vktree, vkids;
      INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_object (
        database_id,
        data,
        kids,
        ktree
      )
      VALUES
        (s_id, _parent.data, vkids, vktree)
      ON CONFLICT (id, database_id) DO UPDATE SET
      database_id = EXCLUDED.database_id
      RETURNING id INTO _newparent_id;
      IF _newparent_id IS NULL THEN
        RAISE EXCEPTION 'parent insert failed';
      END IF;
    ELSE
      INSERT INTO "constructive_platform_function_graph_public".platform_function_graph_object (
        database_id,
        data,
        kids,
        ktree
      )
      VALUES
        (s_id, NULL, ARRAY[_repl]::uuid[], ARRAY[_orig_name]::text[])
      ON CONFLICT (id, database_id) DO UPDATE SET
      database_id = EXCLUDED.database_id
      RETURNING id INTO _newparent_id;
    END IF;
    _orig_name := (path)[i - 1];
    _repl := _newparent_id;
    _uuid_to_return := _newparent_id;
  END LOOP;
  RETURN _uuid_to_return;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION constructive_platform_function_graph_public.set_data_at_path(
  IN s_id uuid,
  IN root uuid,
  IN path text[],
  IN data jsonb
) RETURNS uuid AS $EOFCODE$
DECLARE
  _node "constructive_platform_function_graph_public".platform_function_graph_object;
  _kids uuid[] := ARRAY[]::uuid[];
  _ktree text[] := ARRAY[]::text[];
BEGIN
  SELECT *
  FROM "constructive_platform_function_graph_public".get_node_at_path(s_id, root, path) INTO _node;
  IF _node.id IS NOT NULL THEN
    _kids := _node.kids;
    _ktree := _node.ktree;
  END IF;
  RETURN "constructive_platform_function_graph_public".insert_node_at_path(s_id, root, path, data, _kids, _ktree);
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT ALL ON FUNCTIONS TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT ALL ON FUNCTIONS TO anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT USAGE ON SEQUENCES TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA constructive_platform_function_graph_public
  GRANT ALL ON TABLES TO administrator;

CREATE TABLE constructive_platform_function_graph_public.platform_function_graph_commit ();

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_platform_function_graph_public.platform_function_graph_commit IS 'Commit history — each commit snapshots a tree root for a store';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN author_id uuid;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.author_id IS 'User who authored the changes';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN committer_id uuid;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.committer_id IS 'User who committed (may differ from author)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN date timestamptz;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN date SET NOT NULL;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN date SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.date IS 'Commit timestamp';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.id IS 'Unique commit identifier';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN message text;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.message IS 'Optional commit message';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN parent_ids uuid[];

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.parent_ids IS 'Parent commit IDs (supports merge commits)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN store_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ALTER COLUMN store_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.store_id IS 'Store this commit belongs to';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD COLUMN tree_id uuid;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_commit.tree_id IS 'Root object ID of the tree snapshot at this commit';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_commit 
  ADD CONSTRAINT platform_function_graph_commits_pkey PRIMARY KEY (id, database_id);

CREATE TABLE constructive_platform_function_graph_public.platform_function_graph_object ();

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_platform_function_graph_public.platform_function_graph_object IS 'Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.created_at IS 'Timestamp of object creation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN data jsonb;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.data IS 'Payload data for this object node';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ALTER COLUMN id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.id IS 'Content-addressed UUID v5 — deterministic hash of (data, kids, ktree)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN kids uuid[];

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.kids IS 'Ordered array of child object IDs';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD COLUMN ktree text[];

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD CONSTRAINT platform_function_graph_objects_kids_ktree_chk 
    CHECK (
    cardinality(kids) = cardinality(ktree)
      OR (kids IS NULL
      AND ktree IS NULL)
  );

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_object.ktree IS 'Ordered array of child path names (parallel to kids)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_object 
  ADD CONSTRAINT platform_function_graph_objects_pkey PRIMARY KEY (id, database_id);

CREATE TRIGGER generate_id_hash
  BEFORE INSERT
  ON constructive_platform_function_graph_public.platform_function_graph_object
  FOR EACH ROW
  EXECUTE PROCEDURE constructive_platform_function_graph_private.tg_object_generate_id_hash();

CREATE TABLE constructive_platform_function_graph_public.platform_function_graph_ref ();

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_platform_function_graph_public.platform_function_graph_ref IS 'Branch heads — mutable pointers into the commit chain';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD COLUMN commit_id uuid;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_ref.commit_id IS 'Commit this ref points to';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_ref.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD COLUMN id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_ref.id IS 'Unique ref identifier';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD COLUMN name text;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_ref.name IS 'Ref name (e.g. HEAD, main)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD COLUMN store_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ALTER COLUMN store_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_ref.store_id IS 'Store this ref belongs to';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_ref 
  ADD CONSTRAINT platform_function_graph_refs_pkey PRIMARY KEY (id, database_id);

CREATE TABLE constructive_platform_function_graph_public.platform_function_graph_store ();

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_platform_function_graph_public.platform_function_graph_store IS 'Named stores — one per version-controlled tree (e.g. one graph, one definition set)';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_store.created_at IS 'Timestamp of store creation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_store.database_id IS 'Database scope for multi-tenant isolation';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD COLUMN hash uuid;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_store.hash IS 'Current root object hash of this store';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD COLUMN id uuid;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_store.id IS 'Unique store identifier';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD COLUMN name text;

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_platform_function_graph_public.platform_function_graph_store.name IS 'Human-readable store name';

ALTER TABLE constructive_platform_function_graph_public.platform_function_graph_store 
  ADD CONSTRAINT platform_function_graph_stores_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX idx_platform_function_graph_store_unique_name ON constructive_platform_function_graph_public.platform_function_graph_store (database_id, (decode(md5(lower(name)), 'hex')));