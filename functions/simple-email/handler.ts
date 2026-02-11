import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { send as sendSmtp } from 'simple-smtp-server';
import { send as sendPostmaster } from '@constructive-io/postmaster';
import { parseEnvBoolean } from '@pgpmjs/env';
import { createLogger } from '@pgpmjs/logger';

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
const useSmtp = parseEnvBoolean(process.env.EMAIL_SEND_USE_SMTP) ?? false;
const logger = createLogger('simple-email');

const handler: FunctionHandler<SimpleEmailPayload> = async (params) => {
  const to = getRequiredField(params, 'to');
  const subject = getRequiredField(params, 'subject');

  const html = isNonEmptyString(params.html) ? params.html : undefined;
  const text = isNonEmptyString(params.text) ? params.text : undefined;

  if (!html && !text) {
    throw new Error("Either 'html' or 'text' must be provided");
  }

  const fromEnv = useSmtp ? process.env.SMTP_FROM : process.env.MAILGUN_FROM;
  const from = isNonEmptyString(params.from)
    ? params.from
    : isNonEmptyString(fromEnv)
      ? fromEnv
      : undefined;

  const replyTo = isNonEmptyString(params.replyTo)
    ? params.replyTo
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
    logger.info('DRY RUN email (no send)', logContext);
  } else {
    const sendEmail = useSmtp ? sendSmtp : sendPostmaster;
    await sendEmail({
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
      ...(from && { from }),
      ...(replyTo && { replyTo })
    });

    logger.info('Sent email', logContext);
  }

  return { complete: true };
};

export default handler;
