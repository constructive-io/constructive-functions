
import fetch from 'cross-fetch';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

const invoke = async () => {
    const args = process.argv.slice(2);
    const fnName = args[0];
    const payloadStr = args[1] || '{}';

    if (!fnName) {
        console.error('Usage: ts-node scripts/invoke.ts <function-name> [json-payload]');
        process.exit(1);
    }

    let payload = {};
    try {
        payload = JSON.parse(payloadStr);
    } catch (e) {
        console.error('Invalid JSON payload');
        process.exit(1);
    }

    console.log(`[CLI] Invoking ${fnName} at ${GATEWAY_URL}/${fnName} with payload:`, payload);

    try {
        const res = await fetch(`${GATEWAY_URL}/${fnName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const contentType = res.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        console.log(`[CLI] Type: ${res.status === 200 ? 'SUCCESS' : 'ERROR'} (${res.status})`);
        console.log(JSON.stringify(data, null, 2));

    } catch (e: any) {
        console.error('[CLI] Failed to invoke function:', e.message);
        if (e.code === 'ECONNREFUSED') {
            console.error('Ensure the gateway is running: pnpm dev:all');
        }
    }
};

invoke();
