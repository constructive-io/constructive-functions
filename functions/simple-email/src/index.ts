
import { GraphQLClient } from 'graphql-request';
import { parseEnvBoolean } from '@pgpmjs/env';
import { send as sendEmail } from '@launchql/postmaster';
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

type SimpleEmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const getRequiredField = (
  payload: SimpleEmailPayload,
  field: keyof SimpleEmailPayload
) => {
  const value = payload[field];
  if (!isNonEmptyString(value)) {
    throw new Error(`Missing required field '${String(field)}'`);
  }
  return value;
};

const isDryRun = parseEnvBoolean(process.env.SIMPLE_EMAIL_DRY_RUN) ?? false;


export default async (params: any, context: any) => {
  const { client } = context;
  console.log('[simple-email] processing request');

  let users = null;
  try {
    const data = await client.request(GetUsers);
    users = data?.users;
  } catch (e: any) {
    console.warn('GQL Request failed:', e.message);
  }

  const payload = (params || {}) as SimpleEmailPayload;

  const to = getRequiredField(payload, 'to');
  const subject = getRequiredField(payload, 'subject');

  const html = isNonEmptyString(payload.html) ? payload.html : undefined;
  const text = isNonEmptyString(payload.text) ? payload.text : undefined;

  if (!html && !text) {
    return { error: "Either 'html' or 'text' must be provided" };
  }

  const fromEnv = process.env.MAILGUN_FROM;
  const from = isNonEmptyString(payload.from)
    ? payload.from
    : isNonEmptyString(fromEnv)
      ? fromEnv
      : undefined;

  const replyTo = isNonEmptyString(payload.replyTo)
    ? payload.replyTo
    : undefined;

  const logContext = {
    to,
    subject,
    from,
    replyTo,
    hasHtml: Boolean(html),
    hasText: Boolean(text)
  };

  if (isDryRun) {
    console.log('[simple-email] DRY RUN email (no send)', logContext);
  } else {
    await sendEmail({
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
      ...(from && { from }),
      ...(replyTo && { replyTo })
    });
    console.log('[simple-email] Sent email', logContext);
  }

  return { complete: true, users };
};

// Server boilerplate abstracted to runner.js
