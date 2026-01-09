
import { GraphQLClient } from 'graphql-request';
import OpenAI from 'openai';
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
    console.log('[llm-external] Request received');
    const { provider, prompt } = params;

    if (!prompt) return { error: "Missing prompt" };

    try {
        if (provider === 'openai') {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });

            let users = null;
            try {
                const data = await client.request(GetUsers);
                users = data?.users;
            } catch (e: any) {
                console.warn('GQL Request failed:', e.message);
            }

            return { result: completion.choices[0].message.content, users };
        } else {
            return { error: "Unsupported provider" };
        }
    } catch (e: any) {
        console.error(e);
        return { error: e.message };
    }
};

// Server boilerplate abstracted to runner.js
