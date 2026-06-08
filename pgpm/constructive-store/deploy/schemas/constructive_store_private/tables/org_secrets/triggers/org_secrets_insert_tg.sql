-- Deploy: schemas/constructive_store_private/tables/org_secrets/triggers/org_secrets_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/trigger_fns/org_secrets_hash


CREATE TRIGGER org_secrets_insert_tg
BEFORE INSERT ON "constructive_store_private".org_secrets
FOR EACH ROW
EXECUTE PROCEDURE "constructive_store_private".org_secrets_hash ( );

