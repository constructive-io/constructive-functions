import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { parseEnvBoolean } from '@pgpmjs/env';
import type { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import twilio from 'twilio';

const GetUser = gql`
  query GetUser($userId: UUID!) {
    users(where: { id: { equalTo: $userId } }, first: 1) {
      nodes {
        username
        displayName
      }
    }
  }
`;

const GetDatabaseInfo = gql`
  query GetDatabaseInfo($databaseId: UUID!) {
    databases(where: { id: { equalTo: $databaseId } }, first: 1) {
      nodes {
        sites {
          nodes {
            title
            siteModules(where: { name: { equalTo: "legal_terms_module" } }) {
              nodes {
                data
              }
            }
          }
        }
      }
    }
  }
`;

type SendSmsParams = {
  sms_type:
    | 'sign_in_sms_otp'
    | 'sign_up_sms'
    | 'enable_sms_mfa'
    | 'mfa_challenge_sms'
    | 'phone_verification'
    // DB procedure naming (for compatibility)
    | 'sms_otp_code'
    | 'mfa_verification_code';
  phone_number: string;
  user_id?: string;
  otp_code?: string;
  code?: string;
  expires_in_minutes?: number;
};

type SendSmsContext = {
  client: GraphQLClient;
  meta: GraphQLClient;
  databaseId: string;
  env: Record<string, string | undefined>;
  log: { info: (...args: any[]) => void; error: (...args: any[]) => void };
};

type SmsProvider = 'twilio' | 'aws_sns' | 'vonage' | 'stub';

interface SmsProviderConfig {
  provider: SmsProvider;
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  awsSns?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  vonage?: {
    apiKey: string;
    apiSecret: string;
    fromNumber: string;
  };
}

const getProviderConfig = (env: Record<string, string | undefined>): SmsProviderConfig => {
  const provider = (env.SMS_PROVIDER || 'stub') as SmsProvider;

  switch (provider) {
    case 'twilio':
      return {
        provider,
        twilio: {
          accountSid: env.TWILIO_ACCOUNT_SID || '',
          authToken: env.TWILIO_AUTH_TOKEN || '',
          fromNumber: env.TWILIO_FROM_NUMBER || '',
        },
      };
    case 'aws_sns':
      return {
        provider,
        awsSns: {
          region: env.AWS_REGION || 'us-east-1',
          accessKeyId: env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
        },
      };
    case 'vonage':
      return {
        provider,
        vonage: {
          apiKey: env.VONAGE_API_KEY || '',
          apiSecret: env.VONAGE_API_SECRET || '',
          fromNumber: env.VONAGE_FROM_NUMBER || '',
        },
      };
    default:
      return { provider: 'stub' };
  }
};

const sendSmsViaProvider = async (
  to: string,
  message: string,
  config: SmsProviderConfig,
  log: SendSmsContext['log']
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  switch (config.provider) {
    case 'twilio': {
      if (!config.twilio?.accountSid || !config.twilio?.authToken || !config.twilio?.fromNumber) {
        return { success: false, error: 'Twilio credentials not configured' };
      }
      try {
        const client = twilio(config.twilio.accountSid, config.twilio.authToken);
        const result = await client.messages.create({
          body: message,
          from: config.twilio.fromNumber,
          to,
        });
        log.info('[send-sms] SMS sent via Twilio', { to, messageId: result.sid });
        return { success: true, messageId: result.sid };
      } catch (err: any) {
        log.error('[send-sms] Twilio error', { to, error: err.message });
        return { success: false, error: err.message || 'Twilio send failed' };
      }
    }

    case 'aws_sns': {
      // TODO: Implement AWS SNS integration
      // const sns = new SNSClient({ region: config.awsSns.region, credentials: {...} });
      // const result = await sns.send(new PublishCommand({ PhoneNumber: to, Message: message }));
      log.info('[send-sms] AWS SNS provider not yet implemented', { to });
      return { success: false, error: 'AWS SNS provider not yet implemented' };
    }

    case 'vonage': {
      // TODO: Implement Vonage integration
      // const vonage = new Vonage({ apiKey: config.vonage.apiKey, apiSecret: config.vonage.apiSecret });
      // const result = await vonage.sms.send({ to, from: config.vonage.fromNumber, text: message });
      log.info('[send-sms] Vonage provider not yet implemented', { to });
      return { success: false, error: 'Vonage provider not yet implemented' };
    }

    case 'stub':
    default: {
      log.info('[send-sms] STUB MODE - SMS not actually sent', { to, message });
      return { success: true, messageId: `stub-${Date.now()}` };
    }
  }
};

const sendSms = async (
  params: SendSmsParams,
  context: SendSmsContext
): Promise<{ complete?: boolean; dryRun?: boolean; error?: string; missing?: string }> => {
  const { meta, databaseId, env, log } = context;
  const isDryRun = parseEnvBoolean(env.SEND_SMS_DRY_RUN) ?? false;

  if (!params.sms_type) {
    return { missing: 'sms_type' };
  }
  if (!params.phone_number) {
    return { missing: 'phone_number' };
  }

  const otpCode = params.otp_code || params.code;
  if (!otpCode) {
    return { missing: 'otp_code' };
  }

  const databaseInfo = await meta.request<any>(GetDatabaseInfo, { databaseId });
  const site = databaseInfo?.databases?.nodes?.[0]?.sites?.nodes?.[0];
  if (!site) {
    throw new Error('Site not found for database');
  }

  const legalTermsModule = site.siteModules?.nodes?.[0];
  const appName = site.title || legalTermsModule?.data?.company?.nick || 'App';
  const expiresIn = params.expires_in_minutes ?? 10;

  const smsMessages: Record<string, string> = {
    sign_in_sms_otp: `Your ${appName} sign-in code is: ${otpCode}. Expires in ${expiresIn} min.`,
    sign_up_sms: `Your ${appName} verification code is: ${otpCode}. Expires in ${expiresIn} min.`,
    enable_sms_mfa: `Your ${appName} MFA setup code is: ${otpCode}. Expires in ${expiresIn} min.`,
    mfa_challenge_sms: `Your ${appName} verification code is: ${otpCode}. Expires in ${expiresIn} min.`,
    phone_verification: `Your ${appName} phone verification code is: ${otpCode}. Expires in ${expiresIn} min.`,
    // DB procedure naming (for compatibility)
    sms_otp_code: `Your ${appName} verification code is: ${otpCode}. Expires in ${expiresIn} min.`,
    mfa_verification_code: `Your ${appName} verification code is: ${otpCode}. Expires in ${expiresIn} min.`,
  };

  const message = smsMessages[params.sms_type];
  if (!message) {
    return { error: `Unknown sms_type: ${params.sms_type}` };
  }

  if (isDryRun) {
    log.info('[send-sms] DRY RUN - SMS not sent', {
      sms_type: params.sms_type,
      phone_number: params.phone_number,
      message,
    });
    return { complete: true, dryRun: true };
  }

  const providerConfig = getProviderConfig(env);
  const result = await sendSmsViaProvider(params.phone_number, message, providerConfig, log);

  if (!result.success) {
    throw new Error(result.error || 'Failed to send SMS');
  }

  return { complete: true };
};

const handler: FunctionHandler<SendSmsParams> = async (params, context) => {
  const { client, meta, job, log, env } = context;

  const databaseId = job.databaseId;
  if (!databaseId) {
    return { error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID' };
  }

  log.info('[send-sms] Processing request', {
    sms_type: params.sms_type,
    databaseId,
  });

  const result = await sendSms(params, {
    client,
    meta,
    databaseId,
    env,
    log,
  });

  if (result && typeof result === 'object' && 'missing' in result) {
    throw new Error(`Missing required field: ${result.missing}`);
  }

  return result;
};

export default handler;
