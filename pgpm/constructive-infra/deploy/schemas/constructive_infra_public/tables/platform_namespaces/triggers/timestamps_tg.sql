-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_infra_public".platform_namespaces
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

