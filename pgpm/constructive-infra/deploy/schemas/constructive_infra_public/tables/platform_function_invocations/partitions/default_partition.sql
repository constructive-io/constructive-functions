-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/partitions/default_partition
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table


CREATE TABLE "constructive_infra_public".platform_function_invocations_default
  PARTITION OF "constructive_infra_public".platform_function_invocations
  DEFAULT;
