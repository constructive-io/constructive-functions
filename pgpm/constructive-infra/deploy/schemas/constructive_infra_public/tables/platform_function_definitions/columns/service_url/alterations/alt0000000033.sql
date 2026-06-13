-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/service_url/alterations/alt0000000033
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/service_url/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.service_url IS E'Optional service URL override for function dispatch. NULL = use gateway convention (gatewayUrl/task_identifier). Set for customer-deployed functions or external endpoints.';

