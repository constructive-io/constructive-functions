import { Twilio } from 'twilio';
import gql from 'graphql-tag';

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
    console.log('[twilio-sms] Request received', params);
    const { to, body } = params || {};

    // Verify GQL connection
    try {
        const data = await client.request(GetUsers);
        console.log('[twilio-sms] GQL Check Success:', data?.users?.nodes?.length ? 'Users found' : 'No users');
    } catch (e: any) {
        console.warn('[twilio-sms] GQL Request failed:', e.message);
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
