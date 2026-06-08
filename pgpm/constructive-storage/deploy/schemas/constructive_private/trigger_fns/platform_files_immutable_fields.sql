-- Deploy: schemas/constructive_private/trigger_fns/platform_files_immutable_fields
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema


CREATE FUNCTION "constructive_private".platform_files_immutable_fields() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF ((((((NEW.key IS DISTINCT FROM OLD.key OR NEW.bucket_id IS DISTINCT FROM OLD.bucket_id) OR NEW.database_id IS DISTINCT FROM OLD.database_id) OR NEW.actor_id IS DISTINCT FROM OLD.actor_id) OR NEW.is_public IS DISTINCT FROM OLD.is_public) OR NEW.mime_type IS DISTINCT FROM OLD.mime_type) OR NEW.size IS DISTINCT FROM OLD.size) OR NEW.content_hash IS DISTINCT FROM OLD.content_hash THEN
    RAISE EXCEPTION 'Cannot modify immutable fields on platform_files';
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

