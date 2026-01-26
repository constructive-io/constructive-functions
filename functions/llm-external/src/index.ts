
import { createClient } from '@constructive-db/constructive-sdk';
import OpenAI from 'openai';
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
  console.log('Constructive KNS: Request Received');
  const { headers } = context;
  console.log('[llm-external] Request received');
  const { provider, prompt } = params;

  if (!prompt) return { error: "Missing prompt" };

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  if (provider === 'openai') {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    // SDK call without try-catch
    // SDK call without try-catch
    const result = await sdk.api.findMany({ select: { id: true, name: true }, first: 5 }).execute();
    const users = result.ok ? result.data : null;
    if (!result.ok) console.error('GQL Request failed:', result.errors);

    return { result: completion.choices[0].message.content, users };
  } else if (provider === 'test') {
    // SDK call without try-catch
    const result = await sdk.api.findMany({ select: { id: true, name: true }, first: 10 }).execute();
    const users = result.ok ? result.data : null;
    if (!result.ok) console.error('GQL Request failed:', result.errors);
    return { result: "Mock logic works", users, works: true };
  } else {
    return { error: "Unsupported provider" };
  }
};

// Server boilerplate abstracted to runner.js
