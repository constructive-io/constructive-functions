import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler = async (params, context) => {
  const { url, body, headers: extraHeaders } = params;
  const method = (params.method ?? 'GET').toUpperCase();
  const timeout = params.timeout ?? 30000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(extraHeaders as Record<string, string> ?? {}),
      },
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { responseHeaders[k] = v; });

    return { data, status: res.status, headers: responseHeaders };
  } finally {
    clearTimeout(timer);
  }
};

export default handler;
