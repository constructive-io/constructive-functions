const path = require('path');
const fs = require('fs');

const run = async () => {
    // 1. Resolve Dependencies from CWD (User's Function Context)
    // This logic ensures we find express/graphql-request in the function's node_modules,
    // regardless of where runner.js is located (Local Dev vs Docker).
    const resolveDep = (name) => {
        try {
            return require(require.resolve(name, { paths: [process.cwd()] }));
        } catch (e) {
            console.error(`[runner] Failed to resolve dependency '${name}' from ${process.cwd()}`);
            console.error(e.message);
            process.exit(1);
        }
    };

    const express = resolveDep('express');
    const bodyParser = resolveDep('body-parser');
    const { GraphQLClient } = resolveDep('graphql-request');
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');

    // 2. Resolve User Handler
    const relativePath = process.argv[2] || 'dist/index.js';
    const absolutePath = path.resolve(process.cwd(), relativePath);

    let userModule;
    try {
        userModule = require(absolutePath);
    } catch (e) {
        console.error(`[runner] Failed to load function at ${absolutePath}`);
        console.error(e.message);
        process.exit(1);
    }

    const handler = userModule.default || userModule;

    if (typeof handler !== 'function') {
        console.error(`[runner] Export at ${absolutePath} is not a function.`);
        process.exit(1);
    }

    // 3. Setup App & Helper Functions (Ported from knative-job-fn/src/index.ts)
    // We implement a simplified version of the logic to avoid needing deep imports.
    // However, since we are replacing the shim which used `express` directly usually,
    // or `knative-job-fn` library...
    // Correct approach: The shim used `app` from `@constructive-io/knative-job-fn`.
    // We should try to use THAT if available, to preserve exact behavior (headers, logging).

    let app;
    try {
        // Try to load the standard wrapper if present
        const jobFn = resolveDep('@constructive-io/knative-job-fn');
        // The library usually exports { default: { post: ..., listen: ... } } or similar?
        // Let's check how functions imported it: "import app from '@constructive-io/knative-job-fn';"
        // It exports 'default'.
        const lib = jobFn.default || jobFn;

        // The library exposes an 'app' like object but 'listen' is the main entry.
        // But we want to inject our handler into a route.
        // Library usage in shim: `app.post('/', ...)`
        // Library implementation: `app` IS express() basically, but wrapped.

        // Actually the library exports an object: { post: ..., listen: ... }
        // We can use it directly.
        app = lib;
    } catch (e) {
        // Fallback to raw express if wrapper missing (unlikely given package.json)
        console.warn('[runner] @constructive-io/knative-job-fn not found, falling back to raw express');
        app = express();
        app.use(bodyParser.json());
    }

    // 4. Setup GraphQL Client
    const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql');

    // 5. Setup Route
    app.post('/', async (req, res) => {
        try {
            const result = await handler(req.body, { client, headers: req.headers });

            // Standard Shim Error Handling Heuristics
            if (result && result.error) {
                // Heuristics for 400 vs 500
                if (['Missing prompt', 'Unsupported provider', 'Missing "query" in payload',
                    'Missing repoName or githubToken', 'Missing X-Database-Id header or DEFAULT_DATABASE_ID',
                    'Missing required field', "Either 'html' or 'text' must be provided",
                    "Missing address, message, or signature"].some(s => result.error.includes(s) || s === result.error)) {
                    return res.status(400).json(result);
                }
                return res.status(500).json(result);
            }

            res.status(200).json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    // 6. Start Server
    const port = Number(process.env.PORT ?? 8080);
    app.listen(port, () => {
        console.log(`[runner] Function '${relativePath}' listening on port ${port}`);
    });
};

run().catch(e => {
    console.error('[runner] Fatal:', e);
    process.exit(1);
});
