
import { createClient } from '@constructive-db/constructive-sdk';
import axios from 'axios';  // kept although fetch is used below? fetch is imported from cross-fetch.
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
  const { headers } = context;
  console.log('[llm-internal-calvin] Request received');

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });
  const { prompt } = params;
  const apiKey = process.env.CALVIN_API_KEY;

  if (!apiKey) {
    console.error("Missing CALVIN_API_KEY");
    return { error: "Missing CALVIN_API_KEY" };
  }

  try {
    console.log(`Calling Calvin API with prompt: ${prompt ? prompt.substring(0, 50) + '...' : 'undefined'}`);

    // Call user-specified Calvin API
    const response = await fetch('https://gemma.calvin.launchql.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "RedHatAI/gemma-3-12b-it-quantized.w8a8",
        messages: [{ role: "user", content: prompt || "hello world" }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Calvin API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();
    console.log('Calvin API Response received');

    // Optional: Keep GQL/Client usage if needed for context, but user emphasized the API call.
    // We'll return the API result.
    return {
      result: json.choices?.[0]?.message?.content || json,
      meta: json
    };

  } catch (e: any) {
    console.error('LLM Request failed:', e.message);
    return { error: e.message };
  }
};


// Server boilerplate abstracted to runner.js
