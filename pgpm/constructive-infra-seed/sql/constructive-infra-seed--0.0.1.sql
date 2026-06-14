\echo Use "CREATE EXTENSION constructive-infra-seed" to load this file. \quit
CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_invocations_default PARTITION OF constructive_compute_public.platform_function_invocations DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_execution_logs_default PARTITION OF constructive_compute_public.platform_function_execution_logs DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.org_function_invocations_default PARTITION OF constructive_compute_public.org_function_invocations DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.org_function_execution_logs_default PARTITION OF constructive_compute_public.org_function_execution_logs DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_infra_public.platform_namespace_events_default PARTITION OF constructive_infra_public.platform_namespace_events DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_graph_executions_default PARTITION OF constructive_compute_public.platform_function_graph_executions DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_graph_execution_outputs_default PARTITION OF constructive_compute_public.platform_function_graph_execution_outputs DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_graph_execution_node_states_default PARTITION OF constructive_compute_public.platform_function_graph_execution_node_states DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_compute_log_default PARTITION OF constructive_compute_public.platform_compute_log DEFAULT;

INSERT INTO constructive_infra_public.platform_namespaces (
  name,
  namespace_name,
  description,
  is_active,
  database_id
) VALUES
  ('default', 'default', 'Default platform namespace', true, '00000000-0000-0000-0000-000000000000') ON CONFLICT (database_id, name) DO NOTHING;

INSERT INTO constructive_compute_public.platform_function_definitions (
  name,
  task_identifier,
  service_url,
  is_invocable,
  is_built_in,
  scope,
  description,
  namespace_id,
  required_secrets,
  required_configs,
  inputs,
  outputs,
  props,
  volatile,
  icon,
  category,
  runtime
) VALUES
('node-example', 'node-example', 'http://localhost:8083', true, true, 'platform', 'Example Node.js function — copy this to create a new function', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"payload","type":"json","description":"Incoming job payload"}]'::jsonb, '[{"name":"status","type":"string","description":"Processing status"},{"name":"received","type":"json","description":"Echo of the received params"},{"name":"timestamp","type":"string","description":"ISO timestamp of processing"}]'::jsonb, '[]'::jsonb, false, 'code', 'custom', 'http'),
('python-example', 'python-example', 'http://localhost:8084', true, true, 'platform', 'Example Python function — copy this to create a new Python function', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"message","type":"string","description":"A message to process"}]'::jsonb, '[{"name":"status","type":"string","description":"Processing status"},{"name":"echo","type":"string","description":"Echo of the input message"}]'::jsonb, '[]'::jsonb, false, 'terminal', 'custom', 'http'),
('send-email', 'send-email', 'http://localhost:8081', true, true, 'platform', 'Sends transactional emails via Mailgun or SMTP', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[ROW('MAILGUN_API_KEY', false), ROW('MAILGUN_DOMAIN', false), ROW('MAILGUN_FROM', false)] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[ROW('EMAIL_SEND_USE_SMTP', false), ROW('SMTP_HOST', false), ROW('SMTP_PORT', false), ROW('SMTP_FROM', false), ROW('SEND_EMAIL_DRY_RUN', false)] AS constructive_compute_public.function_requirement[]), '[{"name":"to","type":"string","description":"Recipient email address"},{"name":"subject","type":"string","description":"Email subject line"},{"name":"html","type":"string","description":"HTML body content","optional":true},{"name":"text","type":"string","description":"Plain text body content","optional":true},{"name":"from","type":"string","description":"Sender email address","optional":true},{"name":"replyTo","type":"string","description":"Reply-to email address","optional":true}]'::jsonb, '[{"name":"result","type":"json","description":"Send result with status and message ID"}]'::jsonb, '[]'::jsonb, true, 'mail', 'email', 'http'),
('send-verification-link', 'send-verification-link', 'http://localhost:8082', true, true, 'platform', 'Sends invite, password reset, and verification emails', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[ROW('MAILGUN_API_KEY', false), ROW('MAILGUN_DOMAIN', false), ROW('MAILGUN_FROM', false), ROW('MAILGUN_REPLY', false)] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[ROW('EMAIL_SEND_USE_SMTP', false), ROW('SMTP_HOST', false), ROW('SMTP_PORT', false), ROW('SMTP_FROM', false), ROW('LOCAL_APP_PORT', false), ROW('SEND_VERIFICATION_LINK_DRY_RUN', false)] AS constructive_compute_public.function_requirement[]), CAST('[{"name":"email_type","type":"string","description":"Type of verification email (invite_email, forgot_password, email_verification)"},{"name":"email","type":"string","description":"Recipient email address"},{"name":"invite_type","type":"string","description":"Invite type identifier","optional":true},{"name":"invite_token","type":"string","description":"Invitation token","optional":true},{"name":"sender_id","type":"string","description":"User ID of the sender","optional":true},{"name":"user_id","type":"string","description":"User ID for password reset","optional":true},{"name":"reset_token","type":"string","description":"Password reset token","optional":true},{"name":"email_id","type":"string","description":"Email record ID for verification","optional":true},{"name":"verification_token","type":"string","description":"Email verification token","optional":true}]' AS jsonb), '[{"name":"result","type":"json","description":"Send result with status and message ID"}]'::jsonb, '[]'::jsonb, true, 'send', 'email', 'http'),
('math/add', 'math/add', NULL, true, true, 'platform', 'Adds two numbers', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"a","type":"number"},{"name":"b","type":"number"}]'::jsonb, '[{"name":"sum","type":"number"}]'::jsonb, '[]'::jsonb, false, 'plus', 'math', 'inline'),
('math/multiply', 'math/multiply', NULL, true, true, 'platform', 'Multiplies two numbers', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"a","type":"number"},{"name":"b","type":"number"}]'::jsonb, '[{"name":"product","type":"number"}]'::jsonb, '[]'::jsonb, false, 'x', 'math', 'inline'),
('math/subtract', 'math/subtract', NULL, true, true, 'platform', 'Subtracts b from a', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"a","type":"number"},{"name":"b","type":"number"}]'::jsonb, '[{"name":"difference","type":"number"}]'::jsonb, '[]'::jsonb, false, 'minus', 'math', 'inline'),
('const/number', 'const/number', NULL, true, true, 'platform', 'Outputs a constant number', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[]'::jsonb, '[{"name":"value","type":"number"}]'::jsonb, '[{"name":"value","type":"number","default":0}]'::jsonb, false, 'hash', 'const', 'inline'),
('const/string', 'const/string', NULL, true, true, 'platform', 'Outputs a constant string', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[]'::jsonb, '[{"name":"value","type":"string"}]'::jsonb, '[{"name":"value","type":"string","default":""}]'::jsonb, false, 'type', 'const', 'inline'),
('const/boolean', 'const/boolean', NULL, true, true, 'platform', 'Outputs a constant boolean', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[]'::jsonb, '[{"name":"value","type":"boolean"}]'::jsonb, '[{"name":"value","type":"boolean","default":false}]'::jsonb, false, 'toggle-left', 'const', 'inline'),
('json/select', 'json/select', NULL, true, true, 'platform', 'Extract a value from JSON by dot-path', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"obj","type":"json"}]'::jsonb, '[{"name":"value","type":"any"}]'::jsonb, '[{"name":"path","type":"string","default":""}]'::jsonb, false, 'circle', 'json', 'inline'),
('json/object', 'json/object', NULL, true, true, 'platform', 'Build a JSON object from named inputs', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[]'::jsonb, '[{"name":"value","type":"json"}]'::jsonb, '[]'::jsonb, false, 'braces', 'json', 'inline'),
('json/merge', 'json/merge', NULL, true, true, 'platform', 'Merge two JSON objects', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"a","type":"json"},{"name":"b","type":"json"}]'::jsonb, '[{"name":"value","type":"json"}]'::jsonb, '[]'::jsonb, false, 'git-merge', 'json', 'inline'),
('json/split', 'json/split', NULL, true, true, 'platform', 'Split a JSON object by key list', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"obj","type":"json"}]'::jsonb, '[{"name":"selected","type":"json"},{"name":"rest","type":"json"}]'::jsonb, '[{"name":"keys","type":"json","default":[]}]'::jsonb, false, 'scissors', 'json', 'inline'),
('string/template', 'string/template', NULL, true, true, 'platform', 'Build a string from a template with {{placeholder}} syntax', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[]'::jsonb, '[{"name":"value","type":"string"}]'::jsonb, '[{"name":"template","type":"string","default":""}]'::jsonb, false, 'quote', 'string', 'inline'),
('flow/guard', 'flow/guard', NULL, true, true, 'platform', 'Stop the flow if a condition fails', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"ok","type":"boolean"},{"name":"error","type":"json","optional":true}]'::jsonb, '[{"name":"pass","type":"signal"},{"name":"fail","type":"signal"},{"name":"error","type":"json"}]'::jsonb, '[]'::jsonb, false, 'shield', 'flow', 'inline'),
('coerce', 'coerce', NULL, true, true, 'platform', 'Convert a value to a different type', (SELECT id
FROM constructive_infra_public.platform_namespaces
WHERE
  name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000'), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), CAST(ARRAY[] AS constructive_compute_public.function_requirement[]), '[{"name":"value","type":"any"}]'::jsonb, '[{"name":"value","type":"any"}]'::jsonb, '[{"name":"type","type":"string","default":"string"}]'::jsonb, false, 'repeat', 'flow', 'inline') ON CONFLICT (scope, name) DO UPDATE SET 
  task_identifier = excluded.task_identifier,
  service_url = excluded.service_url,
  namespace_id = excluded.namespace_id,
  required_secrets = excluded.required_secrets,
  required_configs = excluded.required_configs,
  description = excluded.description,
  inputs = excluded.inputs,
  outputs = excluded.outputs,
  props = excluded.props,
  volatile = excluded.volatile,
  icon = excluded.icon,
  category = excluded.category,
  runtime = excluded.runtime;

ALTER TABLE constructive_store_private.platform_secrets 
  ALTER COLUMN database_id SET DEFAULT jwt_private.current_database_id();

CREATE UNIQUE INDEX IF NOT EXISTS platform_secrets_namespace_id_name_idx ON constructive_store_private.platform_secrets (namespace_id, name);

GRANT USAGE ON SCHEMA constructive_compute_public TO authenticated;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_public TO authenticated;

GRANT USAGE ON SCHEMA constructive_infra_public TO authenticated;

GRANT USAGE ON SCHEMA constructive_users_public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_infra_public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_users_public TO authenticated;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_compute_public TO authenticated;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO authenticated;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_infra_public TO authenticated;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_users_public TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_compute_public TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_platform_function_graph_public TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_infra_public TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_users_public TO authenticated;

GRANT USAGE ON SCHEMA constructive_compute_private TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_private TO authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_compute_private TO authenticated;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_private TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_private TO authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_platform_function_graph_private TO authenticated;

GRANT USAGE ON SCHEMA constructive_compute_public TO anonymous;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_public TO anonymous;

GRANT USAGE ON SCHEMA constructive_infra_public TO anonymous;

GRANT USAGE ON SCHEMA constructive_users_public TO anonymous;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_public TO anonymous;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO anonymous;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_infra_public TO anonymous;

GRANT SELECT ON ALL TABLES IN SCHEMA constructive_users_public TO anonymous;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_compute_public TO anonymous;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_platform_function_graph_public TO anonymous;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_infra_public TO anonymous;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_users_public TO anonymous;

GRANT USAGE ON SCHEMA constructive_compute_private TO anonymous;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_compute_private TO anonymous;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_private TO anonymous;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_platform_function_graph_private TO anonymous;

UPDATE services_public.apis SET anon_role = 'authenticated' WHERE database_id = '00000000-0000-0000-0000-000000000000';