-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_infra_public".platform_secret_values
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );
