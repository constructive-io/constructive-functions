/**
 * GraphQL integration tests for send-verification-link handler.
 *
 * These tests use @constructive-io/graphql-test to run against
 * a real PostGraphile + Postgres instance. They require:
 *
 * 1. SQL seed files with test sites, domains, themes, modules, users
 * 2. The PostGraphile URL to pass as GRAPHQL_URL
 * 3. A FunctionContext constructed with real GraphQL clients
 *
 * Install dependencies before running:
 *   pnpm add -D @constructive-io/graphql-test pgsql-test
 */

describe('send-verification-link handler (GraphQL integration)', () => {
  it.todo('invite_email fetches inviter and sends email with correct URL');
  it.todo('forgot_password constructs correct reset URL with tokens');
  it.todo('email_verification constructs correct verify URL');
  it.todo('dry-run mode logs but does not send email');
  it.todo('uses site theme primary color in email template');
  it.todo('handles localhost domains with correct protocol');
});
