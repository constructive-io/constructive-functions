-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/indexes/app_function_invocations_actor_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/actor_id/column
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/created_at/column


CREATE INDEX app_function_invocations_actor_id_created_at_idx ON "constructive_compute_public".app_function_invocations USING BTREE ( actor_id, created_at );

