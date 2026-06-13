-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/triggers/platform_namespaces_rename_proxy_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_private/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_private/trigger_fns/platform_namespaces_rename_proxy


CREATE TRIGGER platform_namespaces_rename_proxy_insert_tg
BEFORE INSERT ON "constructive_infra_public".platform_namespaces
FOR EACH ROW
EXECUTE PROCEDURE "constructive_infra_private".platform_namespaces_rename_proxy ( );

