
import { createClient } from '@constructive-db/constructive-sdk'; // sdk
import { generate } from '@launchql/mjml';
import { send } from '@launchql/postmaster';
import { parseEnvBoolean } from '@pgpmjs/env';

const isDryRun = parseEnvBoolean(process.env.SEND_EMAIL_LINK_DRY_RUN) ?? false;

type SendEmailParams = {
  email_type: 'invite_email' | 'forgot_password' | 'email_verification';
  email: string;
  invite_type?: number | string;
  invite_token?: string;
  sender_id?: string;
  user_id?: string;
  reset_token?: string;
  email_id?: string;
  verification_token?: string;
};

type GraphQLContext = {
  client: any; // Type as 'any' or SDK client type if strictly typed, but for now 'any' allows passing sdk
  meta: any;
  databaseId: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name} `);
  }
  return value;
};

// Removed createGraphQLClient helper as we use createClient from SDK directly

export const sendEmailLink = async (
  params: SendEmailParams,
  context: GraphQLContext
) => {
  const { client, meta, databaseId } = context;

  const validateForType = (): { missing?: string } | null => {
    switch (params.email_type) {
      case 'invite_email':
        if (!params.invite_token || !params.sender_id) {
          return { missing: 'invite_token_or_sender_id' };
        }
        return null;
      case 'forgot_password':
        if (!params.user_id || !params.reset_token) {
          return { missing: 'user_id_or_reset_token' };
        }
        return null;
      case 'email_verification':
        if (!params.email_id || !params.verification_token) {
          return { missing: 'email_id_or_verification_token' };
        }
        return null;
      default:
        return { missing: 'email_type' };
    }
  };

  if (!params.email_type) {
    return { missing: 'email_type' };
  }
  if (!params.email) {
    return { missing: 'email' };
  }

  const typeValidation = validateForType();
  if (typeValidation) {
    return typeValidation;
  }

  // Refactored GetDatabaseInfo using SDK
  // We fetch all siteModules and filter in memory for "legal_terms_module"
  const dbResult = await meta.database.findUnique({
    where: { id: databaseId },
    select: {
      sites: {
        select: {
          domains: {
            select: { subdomain: true, domain: true }
          },
          logo: true, // Assuming logo is JSON/scalar
          title: true,
          siteThemes: {
            select: { theme: true }
          },
          siteModules: {
            select: { name: true, data: true }
          }
        }
      }
    }
  }).execute();

  const databaseInfo = dbResult.ok ? dbResult.data : null;

  // Assuming structure match: database -> sites -> nodes -> [0] 
  // The SDK 'sites' field in 'database' likely returns a connection object { nodes: [...] } 
  // or dependent on generator config. Default is usually connection.
  // We assume 'nodes' property exists on relational fields unless simplified.
  const site = databaseInfo?.sites?.nodes?.[0];
  if (!site) {
    throw new Error('Site not found for database');
  }

  // Filter for legal_terms_module in memory
  const legalTermsModule = site.siteModules?.nodes?.find((m: any) => m.name === "legal_terms_module");
  const domainNode = site.domains?.nodes?.[0];
  const theme = site.siteThemes?.nodes?.[0]?.theme;

  if (!legalTermsModule || !domainNode || !theme) {
    throw new Error('Missing site configuration for email');
  }

  const subdomain = domainNode.subdomain;
  const domain = domainNode.domain;
  const supportEmail = legalTermsModule.data.emails.support;
  const logo = site.logo?.url;
  const company = legalTermsModule.data.company;
  const website = company.website;
  const nick = company.nick;
  const name = company.name;
  const primary = theme.primary;

  const hostname = subdomain ? [subdomain, domain].join('.') : domain;

  // Treat localhost-style hosts specially so we can generate
  // http://localhost[:port]/... links for local dev without
  // breaking production URLs.
  const isLocalHost =
    hostname.startsWith('localhost') ||
    hostname.startsWith('0.0.0.0') ||
    hostname.endsWith('.localhost');

  // Optional: LOCAL_APP_PORT lets you attach a port for local dashboards
  // e.g. LOCAL_APP_PORT=3000 -> http://localhost:3000
  // It is ignored for non-local hostnames. Only allow on DRY RUNs
  const localPort =
    isLocalHost && isDryRun && process.env.LOCAL_APP_PORT
      ? `:${process.env.LOCAL_APP_PORT} `
      : '';

  // Use http only for local dry-run to avoid browser TLS warnings
  // in dev; production stays https.
  const protocol = isLocalHost && isDryRun ? 'http' : 'https';
  const url = new URL(`${protocol}://${hostname}${localPort}`);

  let subject: string;
  let subMessage: string;
  let linkText: string;

  let inviterName: string | undefined;

  switch (params.email_type) {
    case 'invite_email': {
      if (!params.invite_token || !params.sender_id) {
        return { missing: 'invite_token_or_sender_id' };
      }
      url.pathname = 'register';
      url.searchParams.append('invite_token', params.invite_token);
      url.searchParams.append('email', params.email);

      const scope = Number(params.invite_type) === 2 ? 'org' : 'app';
      url.searchParams.append('type', scope);

      // Refactored GetUser
      const inviterResult = await client.user.findUnique({
        where: { id: params.sender_id },
        select: {
          displayName: true
          // profilePicture? if needed
        }
      }).execute();

      const inviter = inviterResult.ok ? inviterResult.data : null;
      inviterName = inviter?.displayName;

      if (inviterName) {
        subject = `${inviterName} invited you to ${nick}!`;
        subMessage = `You've been invited to ${nick}`;
      } else {
        subject = `Welcome to ${nick}!`;
        subMessage = `You've been invited to ${nick}`;
      }
      linkText = 'Join Us';
      break;
    }
    case 'forgot_password': {
      if (!params.user_id || !params.reset_token) {
        return { missing: 'user_id_or_reset_token' };
      }
      url.pathname = 'reset-password';
      url.searchParams.append('role_id', params.user_id);
      url.searchParams.append('reset_token', params.reset_token);
      subject = `${nick} Password Reset Request`;
      subMessage = 'Click below to reset your password';
      linkText = 'Reset Password';
      break;
    }
    case 'email_verification': {
      if (!params.email_id || !params.verification_token) {
        return { missing: 'email_id_or_verification_token' };
      }
      url.pathname = 'verify-email';
      url.searchParams.append('email_id', params.email_id);
      url.searchParams.append('verification_token', params.verification_token);
      subject = `${nick} Email Verification`;
      subMessage = 'Please confirm your email address';
      linkText = 'Confirm Email';
      break;
    }
    default:
      return false;
  }

  const link = url.href;

  const html = generate({
    title: subject,
    link,
    linkText,
    message: subject,
    subMessage,
    bodyBgColor: 'white',
    headerBgColor: 'white',
    messageBgColor: 'white',
    messageTextColor: '#414141',
    messageButtonBgColor: primary,
    messageButtonTextColor: 'white',
    companyName: name,
    supportEmail,
    website,
    logo,
    headerImageProps: {
      alt: 'logo',
      align: 'center',
      border: 'none',
      width: '162px',
      paddingLeft: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingTop: '0'
    }
  });

  if (isDryRun) {
    // eslint-disable-next-line no-console
    console.log('[send-email-link] DRY RUN email (skipping send)', {
      email_type: params.email_type,
      email: params.email,
      subject,
      link
    });
  } else {
    await send({
      to: params.email,
      subject,
      html
    });
  }

  return {
    complete: true,
    ...(isDryRun ? { dryRun: true } : null)
  };
};

export default async (params: any, context: any) => {
  const { headers } = context;

  const getHeader = (key: string) => {
    if (!headers) return undefined;
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === lowerKey) return headers[k];
    }
    return undefined;
  };

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  // Construct our SDK client for 'client' context
  const client = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // SDK call without try-catch - sanity check
  const sanityResult = await client.api.findMany({ select: { id: true, name: true }, first: 1 }).execute();
  if (!sanityResult.ok) {
    console.error('GQL Request failed:', sanityResult.errors);
  }

  const databaseId =
    getHeader('X-Database-Id') || process.env.DEFAULT_DATABASE_ID;

  if (!databaseId) {
    return { error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID' };
  }

  const graphqlUrl = getRequiredEnv('GRAPHQL_URL');
  const metaGraphqlUrl = process.env.META_GRAPHQL_URL || graphqlUrl;

  const meta = createClient({
    endpoint: metaGraphqlUrl,
    headers: {
      ...(process.env.GRAPHQL_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}` } : {}),
      ...(process.env.META_GRAPHQL_HOST_HEADER ? { host: process.env.META_GRAPHQL_HOST_HEADER } : {})
    }
  });

  try {
    const result = await sendEmailLink(params as SendEmailParams, {
      client,
      meta,
      databaseId
    });
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
};

// When executed directly (e.g. via `node dist/index.js`), start an HTTP server.

// Server boilerplate abstracted to runner.js

