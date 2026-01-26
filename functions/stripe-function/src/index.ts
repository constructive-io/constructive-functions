
import { createClient } from '@constructive-db/constructive-sdk';
import Stripe from 'stripe';
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
    const { headers } = context;
    console.log('[stripe-fn] Request received');
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey && process.env.NODE_ENV !== 'test') {
        console.error('Missing STRIPE_SECRET_KEY');
        return { error: 'Missing STRIPE_SECRET_KEY' };
    }

    // Clean headers to avoid conflicts with SDK defaults
    const safeHeaders = { ...headers };
    ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

    const sdk = createClient({
        endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
        headers: safeHeaders || {}
    });

    // SDK call without try-catch
    // Test with sdk.api to verify connectivity
    const result = await sdk.api.findMany({
        select: { id: true, name: true },
        first: 5
    }).execute();

    const users = result.ok ? result.data : null;
    if (!result.ok) {
        console.error('GQL Request failed:', result.errors);
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
