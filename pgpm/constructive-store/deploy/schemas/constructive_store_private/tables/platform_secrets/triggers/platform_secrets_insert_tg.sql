-- Deploy: schemas/constructive_store_private/tables/platform_secrets/triggers/platform_secrets_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/trigger_fns/platform_secrets_hash


CREATE TRIGGER platform_secrets_insert_tg
BEFORE INSERT ON "constructive_store_private".platform_secrets
FOR EACH ROW
EXECUTE PROCEDURE "constructive_store_private".platform_secrets_hash ( );

