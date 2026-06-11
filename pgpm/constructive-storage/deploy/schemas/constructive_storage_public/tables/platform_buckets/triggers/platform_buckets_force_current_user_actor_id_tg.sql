-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/triggers/platform_buckets_force_current_user_actor_id_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema
-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_private/trigger_fns/platform_buckets_force_current_user_actor_id


CREATE TRIGGER platform_buckets_force_current_user_actor_id_tg
BEFORE INSERT ON "constructive_storage_public".platform_buckets
FOR EACH ROW
EXECUTE PROCEDURE "constructive_private".platform_buckets_force_current_user_actor_id ( );

