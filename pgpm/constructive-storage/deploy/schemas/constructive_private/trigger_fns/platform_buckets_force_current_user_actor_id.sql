-- Deploy: schemas/constructive_private/trigger_fns/platform_buckets_force_current_user_actor_id
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema


CREATE FUNCTION "constructive_private".platform_buckets_force_current_user_actor_id() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF jwt_public.current_user_id() IS NOT NULL THEN
    SELECT jwt_public.current_user_id() INTO NEW.actor_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

