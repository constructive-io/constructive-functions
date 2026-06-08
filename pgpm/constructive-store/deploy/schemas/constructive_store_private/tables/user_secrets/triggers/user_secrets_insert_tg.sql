-- Deploy: schemas/constructive_store_private/tables/user_secrets/triggers/user_secrets_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/trigger_fns/user_secrets_hash


CREATE TRIGGER user_secrets_insert_tg
BEFORE INSERT ON "constructive_store_private".user_secrets
FOR EACH ROW
EXECUTE PROCEDURE "constructive_store_private".user_secrets_hash ( );

