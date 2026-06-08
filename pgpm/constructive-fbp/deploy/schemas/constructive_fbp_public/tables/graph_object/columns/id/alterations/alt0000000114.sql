-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/id/alterations/alt0000000114
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/id/column


COMMENT ON COLUMN "constructive_fbp_public".graph_object.id IS E'Content-addressed UUID v5 — deterministic hash of (data, kids, ktree)';

