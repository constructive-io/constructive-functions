-- Deploy: schemas/constructive_fbp_public/tables/graph_ref/columns/name/alterations/alt0000000127
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_ref/columns/name/column


COMMENT ON COLUMN "constructive_fbp_public".graph_ref.name IS E'Ref name (e.g. HEAD, main)';

