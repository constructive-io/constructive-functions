import type { FunctionHandler } from '@constructive-io/fn-runtime';
import type { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import { generate } from '@launchql/mjml';
import { send as sendPostmaster } from '@constructive-io/postmaster';
import { send as sendSmtp } from 'simple-smtp-server';
import { parseEnvBoolean } from '@pgpmjs/env';

const GetUser = gql`
  query GetUser($userId: UUID!) {
    user(id: $userId) {
      username
      displayName
      profilePicture
    }
  }
`;

const GetDatabaseInfo = gql`
  query GetDatabaseInfo($databaseId: UUID!) {
    database(id: $databaseId) {
      sites {
        nodes {
          domains {
            nodes {
              subdomain
              domain
            }
          }
          logo
          title
          siteThemes {
            nodes {
              theme
            }
          }
          siteModules(condition: { name: "legal_terms_module" }) {
            nodes {
              data
            }
          }
        }
      }
    }
  }
`;

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

type SendEmailContext = {
  client: GraphQLClient;
  meta: GraphQLClient;
  databaseId: string;
  env: Record<string, string | undefined>;
  log: { info: (...args: any[]) => void };
};

const sendEmailLink = async (
  params: SendEmailParams,
  context: SendEmailContext
) => {
  const { client, meta, databaseId, env, log } = context;
  const isDryRun = parseEnvBoolean(env.SEND_EMAIL_LINK_DRY_RUN) ?? false;
  const useSmtp = parseEnvBoolean(env.EMAIL_SEND_USE_SMTP) ?? false;

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

  const databaseInfo = await meta.request<any>(GetDatabaseInfo, {
    databaseId
  });

  const site = databaseInfo?.database?.sites?.nodes?.[0];
  if (!site) {
    throw new Error('Site not found for database');
  }

  const legalTermsModule = site.siteModules?.nodes?.[0];
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

  const isLocalDomain =
    domain === 'localhost' ||
    domain.startsWith('localhost') ||
    domain === '0.0.0.0';

  const hostname = subdomain && !isLocalDomain
    ? [subdomain, domain].join('.')
    : domain;

  const isLocalHost =
    hostname.startsWith('localhost') ||
    hostname.startsWith('0.0.0.0') ||
    hostname.endsWith('.localhost');

  const localPort =
    isLocalHost && isDryRun && env.LOCAL_APP_PORT
      ? `:${env.LOCAL_APP_PORT}`
      : '';

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

      const inviter = await client.request<any>(GetUser, {
        userId: params.sender_id
      });
      inviterName = inviter?.user?.displayName;

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
    log.info('DRY RUN email (skipping send)', {
      email_type: params.email_type,
      email: params.email,
      subject,
      link
    });
  } else {
    const sendEmail = useSmtp ? sendSmtp : sendPostmaster;
    await sendEmail({
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

const handler: FunctionHandler<SendEmailParams> = async (params, context) => {
  const { client, meta, job, log, env } = context;

  const databaseId = job.databaseId;
  if (!databaseId) {
    return { error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID' };
  }

  log.info('[send-email-link] Processing request', {
    email_type: params.email_type,
    databaseId
  });

  const result = await sendEmailLink(params, {
    client,
    meta,
    databaseId,
    env,
    log
  });

  // Validation failures return { missing: '...' } — treat as client error
  if (result && typeof result === 'object' && 'missing' in result) {
    throw new Error(`Missing required field: ${(result as any).missing}`);
  }

  return result;
};

export default handler;
