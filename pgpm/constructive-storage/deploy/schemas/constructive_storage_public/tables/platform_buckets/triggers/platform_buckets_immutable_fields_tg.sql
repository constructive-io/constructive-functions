-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/triggers/platform_buckets_immutable_fields_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema
-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_private/trigger_fns/platform_buckets_immutable_fields


CREATE TRIGGER platform_buckets_immutable_fields_tg
BEFORE UPDATE ON "constructive_storage_public".platform_buckets
FOR EACH ROW
EXECUTE PROCEDURE "constructive_private".platform_buckets_immutable_fields ( );

