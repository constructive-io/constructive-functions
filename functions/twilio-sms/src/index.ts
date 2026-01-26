import { createClient } from '@constructive-db/constructive-sdk';
import { Twilio } from 'twilio';

export default async (params: any, context: any) => {
  const { headers } = context;
  console.log('[twilio-sms] Request received', params);
  const { to, body } = params || {};

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // Verify GQL connection (without try-catch)
  const result = await sdk.api.findMany({ select: { id: true, name: true }, first: 1 }).execute();
  if (result.ok) console.error('[twilio-sms] GQL Response:', JSON.stringify(result.data, null, 2));
  if (!result.ok) {
    console.error('[twilio-sms] GQL Request failed:', result.errors);
  }


  // Env vars should be injected by the runtime/k8s
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Missing Twilio configuration");
    return { error: "Missing Twilio configuration (SID, TOKEN, FROM)" };
  }

  if (!to || !body) {
    return { error: "Missing 'to' or 'body' in request" };
  }

  try {
    const clientFn = new Twilio(accountSid, authToken);

    console.log(`Sending SMS to ${to}: ${body}`);

    // In test mode, we might want to mock this or use test credentials.
    const message = await clientFn.messages.create({
      body: body,
      from: fromNumber,
      to: to
    });

    console.log(`SMS sent: ${message.sid}`);
    return { success: true, sid: message.sid, status: message.status };

  } catch (e: any) {
    console.error('[twilio-sms] Error sending SMS:', e);
    throw e; // specific error handling can remain or bubble up
  }
};
