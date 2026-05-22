/**
 * config.ts — Configuration for e2e test provisioning
 *
 * Endpoints:
 *   auth.localhost:PORT     → Auth API (sign up / sign in)
 *   api.localhost:PORT      → Platform API (metaschema)
 *   auth-{db}.localhost:PORT → Database-scoped auth
 *   public-{db}.localhost:PORT → App public API
 */

const PORT = process.env.PORT || '3002';

export interface TestConfig {
  port: string;
  apiEndpoint: string;
  authEndpoint: string;
  dbName?: string;
  databaseId?: string;
  accessToken?: string;
  getDbAuthEndpoint: (dbName: string) => string;
  getAppEndpoint: (dbName: string) => string;
  getAdminEndpoint: (dbName: string) => string;
}

export const config: TestConfig = {
  port: PORT,

  /** Platform API endpoint — metaschema */
  apiEndpoint: process.env.API_ENDPOINT || `http://api.localhost:${PORT}/graphql`,

  /** Auth API endpoint — global sign up/sign in */
  authEndpoint: process.env.AUTH_ENDPOINT || `http://auth.localhost:${PORT}/graphql`,

  /** Database-scoped auth endpoint */
  getDbAuthEndpoint: (dbName: string) =>
    `http://auth-${dbName}.localhost:${PORT}/graphql`,

  /** App public endpoint */
  getAppEndpoint: (dbName: string) =>
    `http://public-${dbName}.localhost:${PORT}/graphql`,

  /** Admin endpoint */
  getAdminEndpoint: (dbName: string) =>
    `http://admin-${dbName}.localhost:${PORT}/graphql`,
};
