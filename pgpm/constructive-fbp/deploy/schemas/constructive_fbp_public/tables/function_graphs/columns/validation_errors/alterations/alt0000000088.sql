-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/validation_errors/alterations/alt0000000088
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/validation_errors/column


COMMENT ON COLUMN "constructive_fbp_public".function_graphs.validation_errors IS E'Array of validation error objects when is_valid = false';

