-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/constraints/auth_rate_limits_subject_id_action_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/column
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/action/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ADD CONSTRAINT auth_rate_limits_subject_id_action_key 
    UNIQUE (subject_id, action);

