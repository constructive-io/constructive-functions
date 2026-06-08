-- Deploy: schemas/constructive_store_private/tables/org_secrets/triggers/org_secrets_update_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/trigger_fns/org_secrets_hash


CREATE TRIGGER org_secrets_update_tg
BEFORE UPDATE ON "constructive_store_private".org_secrets
FOR EACH ROW
WHEN (OLD.value IS DISTINCT FROM NEW.value)
EXECUTE PROCEDURE "constructive_store_private".org_secrets_hash ( );

