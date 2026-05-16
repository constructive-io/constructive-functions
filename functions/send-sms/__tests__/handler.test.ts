import handler from '../handler';

jest.mock('twilio', () => {
  const mockCreate = jest.fn();
  return jest.fn(() => ({
    messages: { create: mockCreate },
  }));
});

import twilio from 'twilio';
const mockTwilioCreate = (twilio as jest.Mock)().messages.create;

const mockLog = {
  info: jest.fn(),
  error: jest.fn(),
};

const mockClient = {
  request: jest.fn(),
};

const mockMeta = {
  request: jest.fn(),
};

const createContext = (overrides = {}) => ({
  client: mockClient as any,
  meta: mockMeta as any,
  job: {
    jobId: 'test-job-1',
    workerId: 'test-worker',
    databaseId: 'test-database-id',
    actorId: null,
  },
  log: mockLog,
  env: {
    SMS_PROVIDER: 'stub',
    SEND_SMS_DRY_RUN: 'false',
    ...overrides,
  },
});

describe('send-sms handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockMeta.request.mockResolvedValue({
      databases: {
        nodes: [
          {
            sites: {
              nodes: [
                {
                  title: 'Test App',
                  siteModules: {
                    nodes: [
                      {
                        data: {
                          company: { nick: 'TestApp' },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should return error when sms_type is missing', async () => {
    const context = createContext();
    const params = { phone_number: '+1234567890', otp_code: '123456' } as any;

    await expect(handler(params, context)).rejects.toThrow('Missing required field: sms_type');
  });

  it('should return error when phone_number is missing', async () => {
    const context = createContext();
    const params = { sms_type: 'sign_in_sms_otp', otp_code: '123456' } as any;

    await expect(handler(params, context)).rejects.toThrow('Missing required field: phone_number');
  });

  it('should return error when otp_code is missing', async () => {
    const context = createContext();
    const params = { sms_type: 'sign_in_sms_otp', phone_number: '+1234567890' } as any;

    await expect(handler(params, context)).rejects.toThrow('Missing required field: otp_code');
  });

  it('should send SMS successfully with stub provider', async () => {
    const context = createContext();
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: '+1234567890',
      otp_code: '123456',
    };

    const result = await handler(params, context);

    expect(result).toEqual({ complete: true });
    expect(mockLog.info).toHaveBeenCalledWith(
      '[send-sms] Processing request',
      expect.any(Object)
    );
  });

  it('should handle dry run mode', async () => {
    const context = createContext({ SEND_SMS_DRY_RUN: 'true' });
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: '+1234567890',
      otp_code: '123456',
    };

    const result = await handler(params, context);

    expect(result).toEqual({ complete: true, dryRun: true });
    expect(mockLog.info).toHaveBeenCalledWith(
      '[send-sms] DRY RUN - SMS not sent',
      expect.any(Object)
    );
  });

  it('should return error when databaseId is missing', async () => {
    const context = {
      ...createContext(),
      job: { jobId: 'test', workerId: 'test', databaseId: null, actorId: null },
    };
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: '+1234567890',
      otp_code: '123456',
    };

    const result = await handler(params, context as any);

    expect(result).toEqual({ error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID' });
  });

  it('should send SMS via Twilio when configured', async () => {
    mockTwilioCreate.mockResolvedValue({ sid: 'SM123456789' });

    const context = createContext({
      SMS_PROVIDER: 'twilio',
      TWILIO_ACCOUNT_SID: 'ACtest123',
      TWILIO_AUTH_TOKEN: 'token123',
      TWILIO_FROM_NUMBER: '+15551234567',
    });
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: '+1234567890',
      otp_code: '123456',
    };

    const result = await handler(params, context);

    expect(result).toEqual({ complete: true });
    expect(mockLog.info).toHaveBeenCalledWith(
      '[send-sms] SMS sent via Twilio',
      expect.objectContaining({ messageId: 'SM123456789' })
    );
  });

  it('should return error when Twilio credentials are missing', async () => {
    const context = createContext({
      SMS_PROVIDER: 'twilio',
      // Missing credentials
    });
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: '+1234567890',
      otp_code: '123456',
    };

    await expect(handler(params, context)).rejects.toThrow('Twilio credentials not configured');
  });

  it('should handle Twilio API errors gracefully', async () => {
    mockTwilioCreate.mockRejectedValue(new Error('Invalid phone number'));

    const context = createContext({
      SMS_PROVIDER: 'twilio',
      TWILIO_ACCOUNT_SID: 'ACtest123',
      TWILIO_AUTH_TOKEN: 'token123',
      TWILIO_FROM_NUMBER: '+15551234567',
    });
    const params = {
      sms_type: 'sign_in_sms_otp' as const,
      phone_number: 'invalid',
      otp_code: '123456',
    };

    await expect(handler(params, context)).rejects.toThrow('Invalid phone number');
  });
});
