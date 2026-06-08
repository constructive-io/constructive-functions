-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/result/alterations/alt0000000070
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/result/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.result IS E'Function return value (success) or structured error (failure)';

