import http from 'node:http';

export interface CapturedRequest {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: unknown;
  receivedAt: Date;
}

export interface MockFunctionServerOptions {
  /** HTTP status code to respond with (default: 200) */
  statusCode?: number;
  /** Response body (default: { status: 'ok' }) */
  responseBody?: unknown;
  /** If set, the server will respond with an error after this delay in ms */
  delayMs?: number;
}

export interface MockFunctionServer {
  /** Base URL of the server, e.g. http://127.0.0.1:12345 */
  url: string;
  /** Port the server is listening on */
  port: number;
  /** All captured requests in order */
  requests: CapturedRequest[];
  /** Close the server */
  close: () => Promise<void>;
  /** Reset captured requests */
  reset: () => void;
  /** Update response behavior */
  setResponse: (opts: MockFunctionServerOptions) => void;
}

/**
 * Start a mock HTTP server that acts as a function endpoint.
 * Captures all incoming requests (headers, body) for assertion.
 */
export function createMockFunctionServer(
  opts: MockFunctionServerOptions = {}
): Promise<MockFunctionServer> {
  const requests: CapturedRequest[] = [];
  let statusCode = opts.statusCode ?? 200;
  let responseBody = opts.responseBody ?? { status: 'ok' };
  let delayMs = opts.delayMs ?? 0;

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        let body: unknown;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
        } catch {
          body = Buffer.concat(chunks).toString('utf-8');
        }

        requests.push({
          method: req.method ?? 'POST',
          url: req.url ?? '/',
          headers: req.headers,
          body,
          receivedAt: new Date(),
        });

        const respond = () => {
          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(responseBody));
        };

        if (delayMs > 0) {
          setTimeout(respond, delayMs);
        } else {
          respond();
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to get server address'));
        return;
      }
      const port = addr.port;
      resolve({
        url: `http://127.0.0.1:${port}`,
        port,
        requests,
        close: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
        reset: () => {
          requests.length = 0;
          statusCode = opts.statusCode ?? 200;
          responseBody = opts.responseBody ?? { status: 'ok' };
          delayMs = opts.delayMs ?? 0;
        },
        setResponse: (newOpts) => {
          if (newOpts.statusCode !== undefined) statusCode = newOpts.statusCode;
          if (newOpts.responseBody !== undefined) responseBody = newOpts.responseBody;
          if (newOpts.delayMs !== undefined) delayMs = newOpts.delayMs;
        },
      });
    });

    server.on('error', reject);
  });
}
