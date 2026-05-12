import { createMockContext } from '../../../tests/helpers/mock-context';

describe('send-verification-link handler (validation)', () => {
  let handler: any;

  beforeEach(() => {
    jest.resetModules();
    handler = require('../handler').default;
  });

  it('returns error when databaseId is missing', async () => {
    const ctx = createMockContext({ databaseId: undefined });
    const result = await handler(
      { email_type: 'invite_email', email: 'a@b.com' },
      ctx
    );
    expect(result).toEqual({
      error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID'
    });
  });

  it('throws for missing email_type', async () => {
    await expect(
      handler({ email: 'a@b.com' }, createMockContext())
    ).rejects.toThrow('Missing required field: email_type');
  });

  it('throws for missing email', async () => {
    await expect(
      handler({ email_type: 'invite_email' }, createMockContext())
    ).rejects.toThrow('Missing required field: email');
  });

  it('throws for invite_email missing invite_token/sender_id', async () => {
    await expect(
      handler(
        { email_type: 'invite_email', email: 'a@b.com' },
        createMockContext()
      )
    ).rejects.toThrow('Missing required field: invite_token_or_sender_id');
  });

  it('throws for forgot_password missing user_id/reset_token', async () => {
    await expect(
      handler(
        { email_type: 'forgot_password', email: 'a@b.com' },
        createMockContext()
      )
    ).rejects.toThrow('Missing required field: user_id_or_reset_token');
  });

  it('throws for email_verification missing email_id/verification_token', async () => {
    await expect(
      handler(
        { email_type: 'email_verification', email: 'a@b.com' },
        createMockContext()
      )
    ).rejects.toThrow(
      'Missing required field: email_id_or_verification_token'
    );
  });
});
