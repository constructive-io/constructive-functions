-- Deploy: schemas/constructive_private/trigger_fns/platform_files_inherit_from_parent
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema


CREATE FUNCTION "constructive_private".platform_files_inherit_from_parent() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  SELECT
    p.database_id,
    p.is_public
  FROM ONLY "constructive_storage_public".platform_buckets AS p
  WHERE
    p.id = NEW.bucket_id INTO NEW.database_id, NEW.is_public;
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'Parent not found: %', NEW.bucket_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

