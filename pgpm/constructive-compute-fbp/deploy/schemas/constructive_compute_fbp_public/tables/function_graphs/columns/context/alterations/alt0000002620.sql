-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/alterations/alt0000002620
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/column


COMMENT ON COLUMN "constructive_compute_fbp_public".function_graphs.context IS E'Evaluator/runtime context (function, js, sql, system)';

