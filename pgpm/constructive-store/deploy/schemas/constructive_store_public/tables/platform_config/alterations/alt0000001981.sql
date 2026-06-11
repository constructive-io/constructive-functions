-- Deploy: schemas/constructive_store_public/tables/platform_config/alterations/alt0000001981
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table


COMMENT ON TABLE "constructive_store_public".platform_config IS E'App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed';

