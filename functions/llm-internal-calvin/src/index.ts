
import { GraphQLClient } from 'graphql-request';
import axios from 'axios';
import gql from 'graphql-tag';
import fetch from 'cross-fetch';

// Proof of GQL connection
const GetUsers = gql`
  query GetUsers {
    users {
      nodes {
        id
        username
      }
    }
  }
`;

export default async (params: any, context: any) => {
  const { client } = context;
  console.log('[llm-internal-calvin] Request received');
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
