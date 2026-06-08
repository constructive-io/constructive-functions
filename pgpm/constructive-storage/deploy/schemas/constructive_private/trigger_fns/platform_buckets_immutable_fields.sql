-- Deploy: schemas/constructive_private/trigger_fns/platform_buckets_immutable_fields
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema


CREATE FUNCTION "constructive_private".platform_buckets_immutable_fields() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF ((((NEW.key IS DISTINCT FROM OLD.key OR NEW.database_id IS DISTINCT FROM OLD.database_id) OR NEW.type IS DISTINCT FROM OLD.type) OR NEW.is_public IS DISTINCT FROM OLD.is_public) OR NEW.actor_id IS DISTINCT FROM OLD.actor_id) OR NEW.allow_custom_keys IS DISTINCT FROM OLD.allow_custom_keys THEN
    RAISE EXCEPTION 'Cannot modify immutable fields on platform_buckets';
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

