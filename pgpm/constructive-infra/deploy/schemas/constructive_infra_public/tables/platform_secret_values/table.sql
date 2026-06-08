-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema

CREATE TABLE "constructive_infra_public".platform_secret_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  secret_name text NOT NULL,
  configured_value text,
  database_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_secret_values_pkey PRIMARY KEY (id),
  CONSTRAINT platform_secret_values_name_db_uniq UNIQUE (secret_name, database_id)
);
