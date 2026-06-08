-- Deploy: schemas/constructive_store_private/tables/org_secrets/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_store_private".org_secrets
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

