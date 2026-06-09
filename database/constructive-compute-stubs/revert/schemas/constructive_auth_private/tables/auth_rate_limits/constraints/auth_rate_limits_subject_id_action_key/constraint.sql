-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/constraints/auth_rate_limits_subject_id_action_key/constraint


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  DROP CONSTRAINT auth_rate_limits_subject_id_action_key;


