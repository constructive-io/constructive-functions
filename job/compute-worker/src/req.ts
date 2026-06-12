/**
 * Platform-aware HTTP dispatch.
 *
 * Instead of resolving URLs from a static manifest or gateway env var,
 * the compute worker reads `service_url` from the function definition
 * resolved dynamically via ComputeModuleLoader.
 *
 * Falls back to a gateway URL pattern when service_url is not set.
 */

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

import { Logger } from '@pgpmjs/logger';

const log = new Logger('compute:req');

export interface ComputeRequestOptions {
  body: unknown;
  database_id?: string;
  actor_id?: string;
  entity_id?: string;
  organization_id?: string;
  worker_id: string;
  job_id: string | number;
  invocation_id: string;
  callback_url?: string;
}

/**
 * Dispatch a job to a function's HTTP endpoint.
 *
 * @param url - The function's service URL (from platform_function_definitions.service_url
 *              or derived from a gateway pattern)
 * @param opts - Request metadata including payload, headers, and tracking IDs
 */
export function compute_request(
  url: string,
  opts: ComputeRequestOptions
): Promise<boolean> {
  log.info('dispatching job', {
    url,
    worker_id: opts.worker_id,
    job_id: opts.job_id,
    invocation_id: opts.invocation_id,
    database_id: opts.database_id,
  });

  return new Promise<boolean>((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (e) {
      return reject(e);
    }

    const is_https = parsed.protocol === 'https:';
    const client = is_https ? https : http;
    const payload = JSON.stringify(opts.body);

    const req = client.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (is_https ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Worker-Id': opts.worker_id,
          'X-Job-Id': String(opts.job_id),
          'X-Invocation-Id': opts.invocation_id,
          ...(opts.database_id ? { 'X-Database-Id': opts.database_id } : {}),
          ...(opts.actor_id ? { 'X-Actor-Id': opts.actor_id } : {}),
          ...(opts.entity_id ? { 'X-Entity-Id': opts.entity_id } : {}),
          ...(opts.organization_id ? { 'X-Organization-Id': opts.organization_id } : {}),
          ...(opts.callback_url ? { 'X-Callback-Url': opts.callback_url } : {}),
        },
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          log.debug(`request completed for job[${opts.job_id}]`);
          resolve(true);
        });
      }
    );

    req.on('error', (error) => {
      log.error(`request error for job[${opts.job_id}]`, error);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}
