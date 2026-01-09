
import { GraphQLClient } from 'graphql-request';
import Stripe from 'stripe';
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
    console.log('[stripe-fn] Request received');
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey && process.env.NODE_ENV !== 'test') {
        console.error('Missing STRIPE_SECRET_KEY');
        return { error: 'Missing STRIPE_SECRET_KEY' };
    }

    let users = null;
    try {
        const data = await client.request(GetUsers);
        users = data?.users;
    } catch (e: any) {
        console.warn('GQL Request failed:', e.message);
    }

    if (!secretKey) {
        // Mock success for test if no key
        return {
            status: 'success',
            data: { chargeId: 'ch_mock_12345' },
            received: params,
            users
        };
    }

    const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
    });

    try {
        const customers = await stripe.customers.list({ limit: 1 });
        console.log('[stripe-fn] Stripe Customers fetch success');
        return { count: customers.data.length, status: "success", users };
    } catch (error: any) {
        console.error('Stripe Error:', error.message);
        return { error: `Stripe Error: ${error.message}`, users };
    }
};

// Server boilerplate abstracted to runner.js
