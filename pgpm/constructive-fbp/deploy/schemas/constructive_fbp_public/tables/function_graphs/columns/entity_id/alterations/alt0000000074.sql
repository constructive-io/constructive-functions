-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/entity_id/alterations/alt0000000074
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/entity_id/column


COMMENT ON COLUMN "constructive_fbp_public".function_graphs.entity_id IS E'Entity context (org/team) for scoped billing';

