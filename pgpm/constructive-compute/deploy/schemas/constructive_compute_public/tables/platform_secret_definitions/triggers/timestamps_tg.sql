-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_compute_public".platform_secret_definitions
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

