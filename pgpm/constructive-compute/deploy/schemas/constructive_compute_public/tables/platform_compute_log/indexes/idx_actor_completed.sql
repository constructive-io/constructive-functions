-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/indexes/idx_actor_completed
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/actor_id/column

CREATE INDEX platform_compute_log_actor_completed_idx
  ON "constructive_compute_public".platform_compute_log (actor_id, completed_at);
